import { TRPCError } from '@trpc/server';
import z from 'zod';
import { db } from '@/server/db';
import { authedProcedure } from '@/server/trpc/trpc';

const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  initialBalance: z.number(),
  balance: z.number(),
  currency: z.string(),
  csvImportPresetId: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Account = z.infer<typeof AccountSchema>;

const AmountSchema = z.object({
  // Stored and returned as cents.
  value: z.number().int(),
  currency: z.string(),
});

const ListAccountsOutputSchema = z.object({
  accounts: z.array(AccountSchema),
  total: AmountSchema,
});

const BaseCurrency = 'EUR';

async function getRates(currencies: string[]) {
  const uniqueCurrencies = [...new Set(currencies)];
  const rates = await Promise.all(
    uniqueCurrencies.map(async (currency) => {
      if (currency === BaseCurrency) {
        return { currency, rateInCents: 100 };
      }
      const rate = await db
        .selectFrom('exchange_rate')
        .select(['close'])
        .where('ticker', '=', `${BaseCurrency}${currency}`)
        .orderBy('date', 'desc')
        .executeTakeFirst();
      return {
        currency,
        // Store rate as cent-scaled integer (e.g. 1.23 -> 123).
        rateInCents: Math.round((rate?.close ?? 1) * 100),
      };
    }),
  );

  return rates.reduce<Record<string, number>>(
    (acc, { currency, rateInCents }) => {
      acc[currency] = rateInCents;
      return acc;
    },
    {},
  );
}

function convertAmountFromCents(
  amountInCents: number,
  currency: string,
  targetCurrency: string,
  rates: Record<string, number>,
) {
  const baseToTargetRateInCents = rates[targetCurrency] ?? 100;
  const baseToTransactionRateInCents = rates[currency] ?? 100;
  // Keep conversion in cent units end-to-end.
  return Math.round(
    (amountInCents * baseToTargetRateInCents) / baseToTransactionRateInCents,
  );
}

const listAccounts = authedProcedure
  .input(z.object({}))
  .output(ListAccountsOutputSchema)
  .query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const accounts = await db
      .selectFrom('bank_account')
      .selectAll()
      .where('deletedAt', 'is', null)
      .where('userId', '=', ctx.user.id)
      .orderBy('createdAt', 'asc')
      .execute();

    const rates = await getRates(accounts.map((account) => account.currency));
    const total = accounts.reduce(
      (sum, account) =>
        sum +
        convertAmountFromCents(
          account.balance,
          account.currency,
          BaseCurrency,
          rates,
        ),
      0,
    );

    return {
      accounts,
      total: {
        value: total,
        currency: BaseCurrency,
      },
    };
  });

const createAccount = authedProcedure
  .input(
    AccountSchema.pick({
      name: true,
      initialBalance: true,
      currency: true,
      csvImportPresetId: true,
    }),
  )
  .output(AccountSchema)
  .mutation(
    async ({
      ctx,
      input: { name, initialBalance, currency, csvImportPresetId },
    }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const existingDeletedAccount = await db
        .selectFrom('bank_account')
        .selectAll()
        .where('userId', '=', ctx.user.id)
        .where('name', '=', name)
        .where('deletedAt', 'is not', null)
        .executeTakeFirst();

      if (existingDeletedAccount) {
        return db
          .updateTable('bank_account')
          .set({
            deletedAt: null,
            initialBalance,
            balance: initialBalance,
            currency,
            csvImportPresetId,
          })
          .where('id', '=', existingDeletedAccount.id)
          .returningAll()
          .executeTakeFirstOrThrow();
      }

      return db
        .insertInto('bank_account')
        .values({
          userId: ctx.user.id,
          name,
          initialBalance,
          balance: initialBalance,
          currency,
          csvImportPresetId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
    },
  );

const updateAccount = authedProcedure
  .input(
    AccountSchema.pick({
      name: true,
      initialBalance: true,
      currency: true,
      csvImportPresetId: true,
    })
      .partial()
      .extend({ id: AccountSchema.shape.id }),
  )
  .output(AccountSchema)
  .mutation(
    async ({
      ctx,
      input: { id, name, initialBalance, currency, csvImportPresetId },
    }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const updatedAccount = await db
        .updateTable('bank_account')
        .set({
          name,
          initialBalance,
          currency,
          csvImportPresetId,
          deletedAt: null,
        })
        .where('userId', '=', ctx.user.id)
        .where('id', '=', id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return initialBalance !== undefined
        ? updateAccountBalance(id)
        : updatedAccount;
    },
  );

const deleteAccount = authedProcedure
  .input(z.object({ id: z.number() }))
  .output(z.void())
  .mutation(async ({ ctx, input: { id } }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    await db
      .updateTable('account_transaction')
      .set({ deletedAt: new Date().toISOString() })
      .where('accountId', '=', id)
      .execute();
    await db
      .updateTable('bank_account')
      .set({ deletedAt: new Date().toISOString() })
      .where('userId', '=', ctx.user.id)
      .where('id', '=', id)
      .execute();
  });

export async function updateAccountBalance(accountId: number) {
  const account = await db
    .selectFrom('bank_account')
    .select('initialBalance')
    .where('id', '=', accountId)
    .executeTakeFirstOrThrow();
  const transactions = await db
    .selectFrom('account_transaction')
    .select('amount')
    .where('accountId', '=', accountId)
    .where('deletedAt', 'is', null)
    .execute();
  return db
    .updateTable('bank_account')
    .set({
      balance: transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        account.initialBalance,
      ),
    })
    .where('id', '=', accountId)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export default {
  list: listAccounts,
  create: createAccount,
  update: updateAccount,
  delete: deleteAccount,
};
