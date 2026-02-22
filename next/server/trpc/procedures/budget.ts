import { TRPCError } from '@trpc/server';
import { jsonArrayFrom } from 'kysely/helpers/sqlite';
import z from 'zod';
import { db } from '@/server/db';
import { getDateWhereFromFilter } from '@/server/trpc/procedures/dateUtils';
import {
  DateFilterSchema,
  type TimeGranularity,
  TimeGranularitySchema,
} from '@/server/trpc/procedures/schema';
import { getUserDefaultCurrency } from '@/server/trpc/procedures/userSettings';
import { authedProcedure } from '@/server/trpc/trpc';

const BudgetEntryTypeSchema = z.enum(['Income', 'Expense']);

type RatesByCurrency = Record<string, number>;

async function getRates(currencies: string[]): Promise<RatesByCurrency> {
  const unique = [...new Set(currencies)];
  const rates = await Promise.all(
    unique.map(async (currency) => {
      if (currency === 'EUR') return { currency, rate: 1 };
      const row = await db
        .selectFrom('exchange_rate')
        .select('close')
        .where('ticker', '=', `EUR${currency}`)
        .orderBy('date', 'desc')
        .executeTakeFirst();
      return { currency, rate: row?.close ?? 1 };
    }),
  );
  return Object.fromEntries(rates.map((r) => [r.currency, r.rate]));
}

function convertAmount(
  amountInCents: number,
  currency: string,
  targetCurrency: string,
  rates: RatesByCurrency,
) {
  if (currency === targetCurrency) return amountInCents;
  const eurToTarget = rates[targetCurrency] ?? 1;
  const eurToSource = rates[currency] ?? 1;
  return Math.round((amountInCents * eurToTarget) / eurToSource);
}

export async function ensureBudgetExists(userId: string) {
  const budgetQuery = db
    .selectFrom('budget')
    .selectAll()
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom('budget_entry')
          .select([
            'budget_entry.id',
            'budget_entry.categoryId',
            'budget_entry.budgetId',
            'budget_entry.target',
            'budget_entry.type',
          ])
          .whereRef('budget.id', '=', 'budget_entry.budgetId'),
      ).as('entries'),
    ])
    .where('userId', '=', userId);

  const existing = await budgetQuery.executeTakeFirst();
  if (existing) return existing;

  await db
    .insertInto('budget')
    .values({ userId, granularity: 'Monthly' })
    .execute();

  return budgetQuery.executeTakeFirstOrThrow();
}

export function granularityToMonthly(granularity: string) {
  switch (granularity) {
    case 'Yearly':
      return 1 / 12;
    case 'Quarterly':
      return 1 / 3;
    default:
      return 1.0;
  }
}

export function monthlyToGranularity(granularity: string) {
  switch (granularity) {
    case 'Yearly':
      return 12.0;
    case 'Quarterly':
      return 3.0;
    default:
      return 1.0;
  }
}

const BudgetEntryOutputSchema = z.object({
  type: BudgetEntryTypeSchema,
  categoryId: z.number(),
  categoryName: z.string(),
  target: z.number(),
  actual: z.number(),
});

const get = authedProcedure
  .input(
    z.object({
      date: DateFilterSchema.optional(),
      granularity: TimeGranularitySchema.optional(),
      currency: z.string().optional(),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.object({
      id: z.number(),
      granularity: z.string(),
      entries: z.array(BudgetEntryOutputSchema),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const budget = await ensureBudgetExists(ctx.user.id);
    const targetCurrency =
      input.currency || (await getUserDefaultCurrency(ctx.user.id));
    const outputGranularity =
      (input.granularity as TimeGranularity) || budget.granularity;

    const dateFilter = getDateWhereFromFilter({
      filter: input.date,
      timeZone: input.timeZone,
    });

    let txQuery = db
      .selectFrom('account_transaction as t')
      .innerJoin('bank_account', 't.accountId', 'bank_account.id')
      .select([
        't.amount',
        't.type',
        't.categoryId',
        'bank_account.currency as accountCurrency',
      ])
      .where('bank_account.userId', '=', ctx.user.id)
      .where('t.deletedAt', 'is', null)
      .where('t.type', '!=', 'Transfer');

    if (dateFilter.gte) txQuery = txQuery.where('t.date', '>=', dateFilter.gte);
    if (dateFilter.lte) txQuery = txQuery.where('t.date', '<=', dateFilter.lte);

    const [transactions, categories] = await Promise.all([
      txQuery.execute(),
      db
        .selectFrom('category')
        .select(['id', 'name'])
        .where('userId', '=', ctx.user.id)
        .where('deletedAt', 'is', null)
        .execute(),
    ]);

    const allCurrencies = [
      ...new Set([
        ...transactions.map((t) => t.accountCurrency),
        targetCurrency,
      ]),
    ];
    const rates = await getRates(allCurrencies);

    const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c]));

    const multiplier =
      outputGranularity === budget.granularity
        ? 1.0
        : granularityToMonthly(budget.granularity) *
          monthlyToGranularity(outputGranularity);

    const getActual = (categoryId: number, type: string | null) =>
      Math.abs(
        transactions
          .filter(
            (t) => t.categoryId === categoryId && (!type || t.type === type),
          )
          .reduce(
            (sum, t) =>
              sum +
              convertAmount(t.amount, t.accountCurrency, targetCurrency, rates),
            0,
          ),
      );

    const usedCategoryIds = new Set(budget.entries.map((e) => e.categoryId));
    const missingCategories = categories.filter(
      (c) => !usedCategoryIds.has(c.id),
    );

    const entries = [
      ...budget.entries.map((entry) => ({
        type: entry.type as 'Income' | 'Expense',
        categoryId: entry.categoryId,
        categoryName: categoriesById[entry.categoryId]?.name ?? 'Unknown',
        target: Math.round(multiplier * entry.target),
        actual: getActual(entry.categoryId, entry.type),
      })),
      ...missingCategories.map((category) => ({
        type: 'Expense' as const,
        categoryId: category.id,
        categoryName: category.name,
        target: 0,
        actual: getActual(category.id, null),
      })),
    ];

    return {
      id: budget.id,
      granularity: outputGranularity,
      entries,
    };
  });

const update = authedProcedure
  .input(
    z.object({
      granularity: TimeGranularitySchema.optional(),
      currency: z.string().optional(),
      entries: z.array(
        z.object({
          categoryId: z.number(),
          type: BudgetEntryTypeSchema,
          target: z.number().int(),
        }),
      ),
    }),
  )
  .output(z.void())
  .mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const [budget, rates] = await Promise.all([
      ensureBudgetExists(ctx.user.id),
      getRates(input.currency ? [input.currency] : []),
    ]);
    const desiredGranularity = input.granularity || budget.granularity;
    const currency = input.currency || 'EUR';

    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable('budget')
        .set({ granularity: desiredGranularity })
        .where('id', '=', budget.id)
        .execute();
      await trx
        .deleteFrom('budget_entry')
        .where('budgetId', '=', budget.id)
        .execute();
      if (input.entries.length > 0) {
        await trx
          .insertInto('budget_entry')
          .values(
            input.entries.map((entry) => ({
              budgetId: budget.id,
              categoryId: entry.categoryId,
              type: entry.type,
              target: convertAmount(entry.target, currency, 'EUR', rates),
            })),
          )
          .execute();
      }
    });
  });

export default { get, update };
