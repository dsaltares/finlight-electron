import { TRPCError } from '@trpc/server';
import { addDays } from 'date-fns/addDays';
import { addMonths } from 'date-fns/addMonths';
import { addQuarters } from 'date-fns/addQuarters';
import { addYears } from 'date-fns/addYears';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import groupBy from 'lodash/groupBy';
import z from 'zod';
import { db } from '@/server/db';
import {
  ensureBudgetExists,
  granularityToMonthly,
  monthlyToGranularity,
} from '@/server/trpc/procedures/budget';
import { getDateWhereFromFilter } from '@/server/trpc/procedures/dateUtils';
import {
  DateFilterSchema,
  type TimeGranularity,
  TimeGranularitySchema,
  TransactionTypeSchema,
} from '@/server/trpc/procedures/schema';
import { getUserDefaultCurrency } from '@/server/trpc/procedures/userSettings';
import { authedProcedure } from '@/server/trpc/trpc';

function getFormatForGranularity(g: TimeGranularity) {
  switch (g) {
    case 'Daily':
      return 'yyyy-MM-dd';
    case 'Monthly':
      return 'yyyy-MM';
    case 'Quarterly':
      return 'yyyy-qqq';
    case 'Yearly':
      return 'yyyy';
  }
}

function getDisplayFormatForGranularity(g: TimeGranularity) {
  switch (g) {
    case 'Daily':
      return 'dd MMM yyyy';
    case 'Monthly':
      return 'MMM yyyy';
    case 'Quarterly':
      return 'qqq yyyy';
    case 'Yearly':
      return 'yyyy';
  }
}

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

type TransactionRow = {
  amount: number;
  date: string;
  type: string;
  accountId: number;
  categoryId: number | null;
  accountCurrency: string;
  accountName: string;
  categoryName: string | null;
};

async function getTransactions(
  userId: string,
  opts: {
    type?: string;
    date?: z.infer<typeof DateFilterSchema>;
    accounts?: number[];
    categories?: number[];
    timeZone?: string;
  },
): Promise<TransactionRow[]> {
  let query = db
    .selectFrom('account_transaction as t')
    .innerJoin('bank_account', 't.accountId', 'bank_account.id')
    .leftJoin('category', 't.categoryId', 'category.id')
    .select([
      't.amount',
      't.date',
      't.type',
      't.accountId',
      't.categoryId',
      'bank_account.currency as accountCurrency',
      'bank_account.name as accountName',
      'category.name as categoryName',
    ])
    .where('bank_account.userId', '=', userId)
    .where('t.deletedAt', 'is', null);

  if (opts.type) query = query.where('t.type', '=', opts.type);
  if (opts.accounts && opts.accounts.length > 0)
    query = query.where('t.accountId', 'in', opts.accounts);
  if (opts.categories && opts.categories.length > 0)
    query = query.where('t.categoryId', 'in', opts.categories);

  const dateFilter = getDateWhereFromFilter({
    filter: opts.date,
    timeZone: opts.timeZone,
  });
  if (dateFilter.gte) query = query.where('t.date', '>=', dateFilter.gte);
  if (dateFilter.lte) query = query.where('t.date', '<=', dateFilter.lte);

  return query.execute();
}

async function resolveTargetCurrency(
  explicitCurrency: string | undefined,
  userId: string,
) {
  return explicitCurrency || (await getUserDefaultCurrency(userId));
}

const getCategoryReport = authedProcedure
  .input(
    z.object({
      type: TransactionTypeSchema,
      date: DateFilterSchema.optional(),
      accounts: z.number().array().optional(),
      currency: z.string().optional(),
      categories: z.number().array().optional(),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.object({
      categories: z.array(
        z.object({ id: z.number(), name: z.string(), value: z.number() }),
      ),
      total: z.number(),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const currency = await resolveTargetCurrency(input.currency, ctx.user.id);
    const transactions = await getTransactions(ctx.user.id, input);
    const rates = await getRates([
      ...new Set([...transactions.map((t) => t.accountCurrency), currency]),
    ]);

    const byCategoryId = groupBy(transactions, (t) => t.categoryId ?? -1);
    const categories = Object.entries(byCategoryId)
      .map(([catId, txns]) => ({
        id: Number.parseInt(catId, 10),
        name: txns[0].categoryName || 'Unknown',
        value: Math.abs(
          txns.reduce(
            (sum, t) =>
              sum + convertAmount(t.amount, t.accountCurrency, currency, rates),
            0,
          ),
        ),
      }))
      .sort((a, b) => b.value - a.value);

    return {
      categories,
      total: categories.reduce((sum, c) => sum + c.value, 0),
    };
  });

const getBucketedCategoryReport = authedProcedure
  .input(
    z.object({
      type: TransactionTypeSchema,
      date: DateFilterSchema.optional(),
      accounts: z.number().array().optional(),
      categories: z.number().array().optional(),
      currency: z.string().optional(),
      granularity: TimeGranularitySchema.optional().default('Monthly'),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.array(
      z.object({
        bucket: z.string(),
        categories: z.record(z.string(), z.number()),
        total: z.number(),
      }),
    ),
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const currency = await resolveTargetCurrency(input.currency, ctx.user.id);
    const transactions = await getTransactions(ctx.user.id, input);
    const rates = await getRates([
      ...new Set([...transactions.map((t) => t.accountCurrency), currency]),
    ]);

    const dateFormat = getFormatForGranularity(input.granularity);
    const displayFormat = getDisplayFormatForGranularity(input.granularity);
    const buckets = groupBy(transactions, (t) => format(t.date, dateFormat));

    return Object.keys(buckets)
      .sort()
      .map((key) => {
        const byCat = groupBy(buckets[key], (t) => t.categoryId ?? 'unknown');
        const cats = Object.values(byCat).map((txns) => ({
          name: txns[0].categoryName || 'Unknown',
          value: Math.abs(
            txns.reduce(
              (sum, t) =>
                sum +
                convertAmount(t.amount, t.accountCurrency, currency, rates),
              0,
            ),
          ),
        }));
        return {
          bucket: format(parse(key, dateFormat, new Date()), displayFormat),
          categories: Object.fromEntries(cats.map((c) => [c.name, c.value])),
          total: cats.reduce((sum, c) => sum + c.value, 0),
        };
      });
  });

const getIncomeVsExpensesReport = authedProcedure
  .input(
    z.object({
      date: DateFilterSchema.optional(),
      accounts: z.number().array().optional(),
      currency: z.string().optional(),
      categories: z.number().array().optional(),
      granularity: TimeGranularitySchema.optional().default('Monthly'),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.array(
      z.object({
        bucket: z.string(),
        income: z.number(),
        expenses: z.number(),
        difference: z.number(),
      }),
    ),
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const currency = await resolveTargetCurrency(input.currency, ctx.user.id);
    const transactions = await getTransactions(ctx.user.id, input);
    const rates = await getRates([
      ...new Set([...transactions.map((t) => t.accountCurrency), currency]),
    ]);

    const dateFormat = getFormatForGranularity(input.granularity);
    const displayFormat = getDisplayFormatForGranularity(input.granularity);
    const buckets = groupBy(transactions, (t) => format(t.date, dateFormat));

    return Object.keys(buckets)
      .sort()
      .map((key) => {
        const bucket = buckets[key];
        const income = bucket
          .filter((t) => t.type === 'Income')
          .reduce(
            (sum, t) =>
              sum + convertAmount(t.amount, t.accountCurrency, currency, rates),
            0,
          );
        const expenses = bucket
          .filter((t) => t.type === 'Expense')
          .reduce(
            (sum, t) =>
              sum - convertAmount(t.amount, t.accountCurrency, currency, rates),
            0,
          );
        return {
          bucket: format(parse(key, dateFormat, new Date()), displayFormat),
          income,
          expenses,
          difference: income - expenses,
        };
      });
  });

type PositionBucket = {
  bucket: string;
  positions: Record<string, number>;
  total: number;
};

async function computeAccountBalances(
  userId: string,
  input: {
    date?: z.infer<typeof DateFilterSchema>;
    accounts?: number[];
    currency?: string;
    granularity?: TimeGranularity;
    timeZone?: string;
  },
): Promise<PositionBucket[]> {
  const currency = await resolveTargetCurrency(input.currency, userId);
  const transactions = await getTransactions(userId, {
    date: input.date,
    accounts: input.accounts,
    timeZone: input.timeZone,
  });

  let accountsQuery = db
    .selectFrom('bank_account')
    .selectAll()
    .where('userId', '=', userId)
    .where('deletedAt', 'is', null);
  if (input.accounts && input.accounts.length > 0)
    accountsQuery = accountsQuery.where('id', 'in', input.accounts);
  const accounts = await accountsQuery.execute();
  const accountIds = accounts.map((a) => a.id);
  const accountsById = Object.fromEntries(accounts.map((a) => [a.id, a]));
  const accountsByName = Object.fromEntries(accounts.map((a) => [a.name, a]));
  const rates = await getRates([
    ...new Set([...accounts.map((a) => a.currency), currency]),
  ]);

  const granularity = input.granularity ?? 'Monthly';
  const dateFormat = getFormatForGranularity(granularity);
  const displayFormat = getDisplayFormatForGranularity(granularity);
  const buckets = groupBy(transactions, (t) => format(t.date, dateFormat));
  const bucketKeys = Object.keys(buckets).sort();
  const data: PositionBucket[] = [];

  for (const key of bucketKeys) {
    const prevPositions = Object.fromEntries(
      accountIds.map((id) => [
        id,
        data.length > 0
          ? (data[data.length - 1].positions[accountsById[id].name] ?? 0)
          : accountsById[id].initialBalance,
      ]),
    );
    const positions = Object.fromEntries(
      accountIds.map((id) => {
        const acctTxns = buckets[key].filter((t) => t.accountId === id);
        const balance = acctTxns.reduce(
          (sum, t) => sum + t.amount,
          prevPositions[id],
        );
        return [accountsById[id].name, balance];
      }),
    );
    data.push({
      bucket: format(parse(key, dateFormat, new Date()), displayFormat),
      positions,
      total: 0,
    });
  }

  const dateFilter = getDateWhereFromFilter({
    filter: input.date,
    timeZone: input.timeZone,
  });
  const fmtFrom = dateFilter.gte
    ? format(dateFilter.gte, dateFormat)
    : undefined;
  const fmtUntil = dateFilter.lte
    ? format(dateFilter.lte, dateFormat)
    : undefined;

  return data
    .filter((_d, i) => {
      if (fmtFrom && bucketKeys[i] < fmtFrom) return false;
      if (fmtUntil && bucketKeys[i] > fmtUntil) return false;
      return true;
    })
    .map((datum) => {
      const positions = Object.fromEntries(
        Object.entries(datum.positions).map(([name, balance]) => [
          name,
          convertAmount(
            balance,
            accountsByName[name]?.currency ?? 'EUR',
            currency,
            rates,
          ),
        ]),
      );
      return {
        ...datum,
        positions,
        total: Object.values(positions).reduce((sum, v) => sum + v, 0),
      };
    });
}

const getAccountBalancesReport = authedProcedure
  .input(
    z.object({
      date: DateFilterSchema.optional(),
      accounts: z.number().array().optional(),
      currency: z.string().optional(),
      granularity: TimeGranularitySchema.optional().default('Monthly'),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.array(
      z.object({
        bucket: z.string(),
        positions: z.record(z.string(), z.number()),
        total: z.number(),
      }),
    ),
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return computeAccountBalances(ctx.user.id, input);
  });

const getBalanceForecastReport = authedProcedure
  .input(
    z.object({
      date: DateFilterSchema.optional(),
      accounts: z.number().array().optional(),
      currency: z.string().optional(),
      granularity: TimeGranularitySchema.optional().default('Monthly'),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.array(
      z.object({
        bucket: z.string(),
        balance: z.number().optional(),
        forecast: z.number().optional(),
      }),
    ),
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const balancesResult = await computeAccountBalances(ctx.user.id, input);
    if (balancesResult.length === 0) return [];

    const averageDelta =
      balancesResult.length === 1
        ? 0
        : balancesResult
            .slice(1)
            .reduce(
              (sum, b, i) => sum + (b.total - balancesResult[i].total),
              0,
            ) /
          (balancesResult.length - 1);

    const buckets = balancesResult.map(({ bucket, total }, index) => ({
      bucket,
      balance: total,
      forecast: balancesResult[0].total + averageDelta * index,
    }));

    const granularity = input.granularity ?? 'Monthly';
    const forecastBuckets = getEmptyForecastBuckets(
      buckets[buckets.length - 1].bucket,
      granularity,
    ).map(({ bucket }, index) => ({
      bucket,
      forecast: Math.max(
        0,
        (buckets[buckets.length - 1]?.balance ?? 0) + averageDelta * index,
      ),
    }));

    return [...buckets, ...forecastBuckets];
  });

function getEmptyForecastBuckets(
  lastBucket: string,
  granularity: TimeGranularity,
) {
  const displayFormat = getDisplayFormatForGranularity(granularity);
  const lastDate = parse(lastBucket, displayFormat, new Date());
  const numBuckets =
    granularity === 'Daily'
      ? 31
      : granularity === 'Monthly'
        ? 12
        : granularity === 'Quarterly'
          ? 9
          : 6;
  const addFn =
    granularity === 'Daily'
      ? addDays
      : granularity === 'Monthly'
        ? addMonths
        : granularity === 'Quarterly'
          ? addQuarters
          : addYears;
  return Array.from({ length: numBuckets }, (_, i) => ({
    bucket: format(addFn(lastDate, i), displayFormat),
  }));
}

const getBudgetOverTimeReport = authedProcedure
  .input(
    z.object({
      type: TransactionTypeSchema,
      date: DateFilterSchema.optional(),
      accounts: z.number().array().optional(),
      categories: z.number().array().optional(),
      currency: z.string().optional(),
      granularity: TimeGranularitySchema.optional().default('Monthly'),
      timeZone: z.string().optional(),
    }),
  )
  .output(
    z.array(
      z.object({
        bucket: z.string(),
        categories: z.record(z.string(), z.number()),
        budgetCategories: z.record(z.string(), z.number()),
        total: z.number(),
        budgetTarget: z.number(),
      }),
    ),
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
    const currency = await resolveTargetCurrency(input.currency, ctx.user.id);

    const [transactions, budget, categories] = await Promise.all([
      getTransactions(ctx.user.id, input),
      ensureBudgetExists(ctx.user.id),
      db
        .selectFrom('category')
        .select(['id', 'name'])
        .where('userId', '=', ctx.user.id)
        .where('deletedAt', 'is', null)
        .execute(),
    ]);

    const rates = await getRates([
      ...new Set([...transactions.map((t) => t.accountCurrency), currency]),
    ]);

    const categoriesById = Object.fromEntries(
      categories.map((c) => [c.id, c.name]),
    );

    const dateFormat = getFormatForGranularity(input.granularity);
    const displayFormat = getDisplayFormatForGranularity(input.granularity);

    const multiplier =
      granularityToMonthly(budget.granularity) *
      monthlyToGranularity(input.granularity);

    const categorySet =
      input.categories && input.categories.length > 0
        ? new Set(input.categories)
        : null;

    const budgetCategories: Record<string, number> = {};
    let budgetTarget = 0;
    for (const entry of budget.entries) {
      if (entry.type !== input.type) continue;
      if (categorySet && !categorySet.has(entry.categoryId)) continue;
      const name = categoriesById[entry.categoryId] ?? 'Unknown';
      const target = Math.round(
        convertAmount(entry.target, 'EUR', currency, rates) * multiplier,
      );
      budgetCategories[name] = (budgetCategories[name] ?? 0) + target;
      budgetTarget += target;
    }

    const buckets = groupBy(transactions, (t) => format(t.date, dateFormat));

    return Object.keys(buckets)
      .sort()
      .map((key) => {
        const byCat = groupBy(buckets[key], (t) => t.categoryId ?? 'unknown');
        const cats = Object.values(byCat).map((txns) => ({
          name:
            (txns[0].categoryId
              ? categoriesById[txns[0].categoryId]
              : undefined) ?? 'Unknown',
          value: Math.abs(
            txns.reduce(
              (sum, t) =>
                sum +
                convertAmount(t.amount, t.accountCurrency, currency, rates),
              0,
            ),
          ),
        }));
        return {
          bucket: format(parse(key, dateFormat, new Date()), displayFormat),
          categories: Object.fromEntries(cats.map((c) => [c.name, c.value])),
          budgetCategories,
          total: cats.reduce((sum, c) => sum + c.value, 0),
          budgetTarget,
        };
      });
  });

export default {
  getCategoryReport,
  getBucketedCategoryReport,
  getIncomeVsExpensesReport,
  getAccountBalancesReport,
  getBalanceForecastReport,
  getBudgetOverTimeReport,
};
