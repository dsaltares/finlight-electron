import { TRPCError } from '@trpc/server';
import z from 'zod';
import { db } from '@/server/db';
import { authedProcedure } from '../trpc';
import { updateAccountBalance } from './accounts';
import { getDateWhereFromFilter } from '@/server/trpc/procedures/dateUtils';
import {
  DateFilterSchema,
  DateSchema,
  type TransactionType,
  TransactionTypeSchema,
} from './schema';

export const TransactionSchema = z.object({
  id: z.number(),
  amount: z.number(),
  date: DateSchema,
  description: z.string(),
  type: TransactionTypeSchema,
  categoryId: z.number().nullable(),
  accountId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

const listTransactions = authedProcedure
  .input(
    z.object({
      date: DateFilterSchema.optional(),
      timeZone: z.string().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      accounts: z.number().array().optional(),
      type: TransactionTypeSchema.optional(),
      categories: z.number().array().optional(),
      description: z.string().optional(),
    }),
  )
  .output(z.array(TransactionSchema))
  .query(
    async ({
      ctx,
      input: {
        date,
        timeZone,
        minAmount,
        maxAmount,
        accounts,
        type,
        categories,
        description,
      },
    }) => {
      const userId = ctx.user?.id;
      if (!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      let query = await db
        .selectFrom('account_transaction as t')
        .innerJoin('bank_account', 't.accountId', 'bank_account.id')
        .selectAll('t')
        .where('bank_account.userId', '=', userId)
        .where('t.deletedAt', 'is', null);

      if (accounts && accounts.length > 0) {
        query = query.where('accountId', 'in', accounts);
      }

      const dateFilter = getDateWhereFromFilter({ filter: date, timeZone });
      if (dateFilter.gte) {
        query = query.where('date', '>=', dateFilter.gte);
      }
      if (dateFilter.lte) {
        query = query.where('date', '<=', dateFilter.lte);
      }

      if (minAmount !== undefined) {
        query = query.where('amount', '>=', minAmount);
      }
      if (maxAmount !== undefined) {
        query = query.where('amount', '<=', maxAmount);
      }

      if (type) {
        query = query.where('type', 'is', type);
      }

      if (categories && categories.length > 0) {
        query = query.where('categoryId', 'in', categories);
      }

      if (description) {
        query = query.where('description', 'ilike', `%${description}%`);
      }

      return query.$narrowType<{ type: TransactionType }>().execute();
    },
  );

const createTransaction = authedProcedure
  .input(
    TransactionSchema.pick({
      amount: true,
      date: true,
      description: true,
      type: true,
      categoryId: true,
      accountId: true,
    }),
  )
  .output(TransactionSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const account = await db
      .selectFrom('bank_account')
      .selectAll()
      .where('userId', '=', userId)
      .where('id', '=', input.accountId)
      .executeTakeFirst();
    if (!account) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' });
    }
    const transaction = await db
      .insertInto('account_transaction')
      .values({
        ...input,
        accountId: account.id,
      })
      .returningAll()
      .$narrowType<{ type: TransactionType }>()
      .executeTakeFirstOrThrow();

    await updateAccountBalance(account.id);
    return transaction;
  });

const createTransactions = authedProcedure
  .input(
    z.object({
      accountId: z.number(),
      transactions: z.array(
        TransactionSchema.pick({
          amount: true,
          date: true,
          description: true,
          categoryId: true,
        }),
      ),
    }),
  )
  .output(z.number())
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const account = await db
      .selectFrom('bank_account')
      .selectAll()
      .where('userId', '=', userId)
      .where('id', '=', input.accountId)
      .executeTakeFirst();
    if (!account) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' });
    }
    const transactions = await db
      .insertInto('account_transaction')
      .values(
        input.transactions.map((transaction) => ({
          ...transaction,
          accountId: account.id,
        })),
      )
      .returningAll()
      .execute();
    await updateAccountBalance(account.id);
    return transactions.length;
  });

const updateTransaction = authedProcedure
  .input(
    TransactionSchema.pick({
      amount: true,
      date: true,
      description: true,
      type: true,
      categoryId: true,
    })
      .partial()
      .extend({ id: TransactionSchema.shape.id }),
  )
  .output(TransactionSchema)
  .mutation(async ({ ctx, input: { id, ...fields } }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const existing = await db
      .selectFrom('account_transaction')
      .select('accountId')
      .innerJoin(
        'bank_account',
        'account_transaction.accountId',
        'bank_account.id',
      )
      .where('bank_account.userId', '=', userId)
      .where('account_transaction.id', '=', id)
      .where('account_transaction.deletedAt', 'is', null)
      .executeTakeFirst();
    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }
    const transaction = await db
      .updateTable('account_transaction')
      .set(fields)
      .where('id', '=', id)
      .returningAll()
      .$narrowType<{ type: TransactionType }>()
      .executeTakeFirstOrThrow();
    await updateAccountBalance(existing.accountId);
    return transaction;
  });

const updateManyTransactions = authedProcedure
  .input(
    TransactionSchema.pick({
      amount: true,
      date: true,
      description: true,
      type: true,
      categoryId: true,
    })
      .partial()
      .extend({ ids: z.number().array().min(1) }),
  )
  .output(z.number())
  .mutation(async ({ ctx, input: { ids, ...fields } }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const owned = await db
      .selectFrom('account_transaction')
      .select(['account_transaction.id', 'account_transaction.accountId'])
      .innerJoin(
        'bank_account',
        'account_transaction.accountId',
        'bank_account.id',
      )
      .where('bank_account.userId', '=', userId)
      .where('account_transaction.id', 'in', ids)
      .where('account_transaction.deletedAt', 'is', null)
      .execute();
    if (owned.length !== ids.length) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'One or more transactions not found',
      });
    }
    if (Object.keys(fields).length === 0) {
      return 0;
    }
    await db
      .updateTable('account_transaction')
      .set(fields)
      .where('id', 'in', ids)
      .execute();
    const affectedAccountIds = [...new Set(owned.map((row) => row.accountId))];
    await Promise.all(
      affectedAccountIds.map((accountId) => updateAccountBalance(accountId)),
    );
    return owned.length;
  });

const deleteTransaction = authedProcedure
  .input(z.object({ id: z.number() }))
  .output(z.void())
  .mutation(async ({ ctx, input: { id } }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const existing = await db
      .selectFrom('account_transaction')
      .select('accountId')
      .innerJoin(
        'bank_account',
        'account_transaction.accountId',
        'bank_account.id',
      )
      .where('bank_account.userId', '=', userId)
      .where('account_transaction.id', '=', id)
      .where('account_transaction.deletedAt', 'is', null)
      .executeTakeFirst();
    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }
    await db
      .updateTable('account_transaction')
      .set({ deletedAt: new Date().toISOString() })
      .where('id', '=', id)
      .execute();
    await updateAccountBalance(existing.accountId);
  });

const deleteManyTransactions = authedProcedure
  .input(z.object({ ids: z.number().array().min(1) }))
  .output(z.number())
  .mutation(async ({ ctx, input: { ids } }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const owned = await db
      .selectFrom('account_transaction')
      .select(['account_transaction.id', 'account_transaction.accountId'])
      .innerJoin(
        'bank_account',
        'account_transaction.accountId',
        'bank_account.id',
      )
      .where('bank_account.userId', '=', userId)
      .where('account_transaction.id', 'in', ids)
      .where('account_transaction.deletedAt', 'is', null)
      .execute();
    if (owned.length !== ids.length) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'One or more transactions not found',
      });
    }
    await db
      .updateTable('account_transaction')
      .set({ deletedAt: new Date().toISOString() })
      .where('id', 'in', ids)
      .execute();
    const affectedAccountIds = [...new Set(owned.map((row) => row.accountId))];
    await Promise.all(
      affectedAccountIds.map((accountId) => updateAccountBalance(accountId)),
    );
    return owned.length;
  });

export default {
  list: listTransactions,
  create: createTransaction,
  createMany: createTransactions,
  update: updateTransaction,
  updateMany: updateManyTransactions,
  delete: deleteTransaction,
  deleteMany: deleteManyTransactions,
};
