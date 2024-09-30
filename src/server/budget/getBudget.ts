import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { startOfYear } from 'date-fns/startOfYear';
import { endOfYear } from 'date-fns/endOfYear';
import { startOfQuarter } from 'date-fns/startOfQuarter';
import { endOfQuarter } from 'date-fns/endOfQuarter';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';
import createUTCDate from '@lib/createUTCDate';
import { type Procedure, procedure } from '@server/trpc';
import { convertAmount, getRates } from '@server/reports/utils';
import db from '@server/db';
import type { BankAccount, Category } from '@server/db/types';
import type { Transaction } from '@server/transactions/types';
import { GetBudgetInput, GetBudgetOutput } from './types';
import type { BudgetEntryType, TimeGranularity } from './types';
import {
  ensureBudgetExists,
  granularityToMonthly,
  monthlyToGranularity,
} from './utils';

const getBudget: Procedure<GetBudgetInput, GetBudgetOutput> = async ({
  input: { date = createUTCDate(), granularity, currency = 'EUR' },
}) => {
  const budget = await ensureBudgetExists();
  const outputGranularity = granularity || budget.granularity;
  const { from, until } = getDateRange(createUTCDate(date), outputGranularity);
  const [transactions, categories] = await Promise.all([
    db
      .selectFrom('accountTransaction')
      .selectAll()
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom('bankAccount')
            .select([
              'id',
              'name',
              'initialBalance',
              'balance',
              'currency',
              'csvImportPresetId',
              'createdAt',
              'updatedAt',
              'deletedAt',
            ])
            .whereRef('bankAccount.id', '=', 'accountTransaction.accountId'),
        ).as('account'),
      ])
      .where('type', '!=', 'Transfer')
      .where('deletedAt', 'is', null)
      .where('date', '>=', from.toISOString())
      .where('date', '<=', until.toISOString())
      .execute(),
    db
      .selectFrom('category')
      .selectAll()
      .where('deletedAt', 'is', null)
      .execute(),
  ]);
  const rates = await getRates(
    Array.from(
      new Set(
        transactions.map(
          (transaction) => transaction.account?.currency || 'EUR',
        ),
      ),
    ),
  );
  const categoriesById = categories.reduce<Record<number, Category>>(
    (acc, category) => ({ ...acc, [category.id]: category }),
    {},
  );
  const usedCategories = new Set(
    budget.entries.map((entry) => entry.categoryId),
  );
  const missingCategories = categories.filter(
    (category) => !usedCategories.has(category.id),
  );
  const multiplier =
    outputGranularity === budget.granularity
      ? 1.0
      : granularityToMonthly(budget.granularity) *
        monthlyToGranularity(outputGranularity);
  return {
    ...budget,
    entries: [
      ...budget.entries.map((entry) => ({
        ...entry,
        categoryName: categoriesById[entry.categoryId].name,
        target: Math.round(multiplier * entry.target * 100) / 100,
        actual: getActualForCategory(
          entry.categoryId,
          entry.type,
          transactions,
          currency,
          rates,
        ),
      })),
      ...missingCategories.map((category) => ({
        type: 'Expense' as const,
        categoryId: category.id,
        categoryName: category.name,
        target: 0,
        actual: getActualForCategory(
          category.id,
          null,
          transactions,
          currency,
          rates,
        ),
      })),
    ],
  };
};

export default procedure
  .input(GetBudgetInput)
  .output(GetBudgetOutput)
  .query(getBudget);

const getDateRange = (date: Date, granularity: TimeGranularity) => {
  switch (granularity) {
    case 'Yearly':
      return {
        from: startOfYear(date),
        until: endOfYear(date),
      };
    case 'Quarterly':
      return {
        from: startOfQuarter(date),
        until: endOfQuarter(date),
      };
    default:
      return {
        from: startOfMonth(date),
        until: endOfMonth(date),
      };
  }
};

const getActualForCategory = (
  categoryId: number,
  type: BudgetEntryType | null,
  transactions: (Omit<Transaction, 'numAttachments'> & {
    account: BankAccount | null;
  })[],
  currency: string,
  rates: Record<string, number>,
) =>
  Math.abs(
    transactions
      .filter(
        (transaction) =>
          transaction.categoryId === categoryId &&
          (!type || transaction.type === type),
      )
      .reduce(
        (sum, transaction) =>
          sum +
          convertAmount(
            transaction.amount,
            transaction.account?.currency || 'EUR',
            currency,
            rates,
          ),
        0,
      ),
  );
