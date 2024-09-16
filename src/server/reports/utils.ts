import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import db from '@server/db';
import type {
  AccountTransaction,
  BankAccount,
  Category,
} from '@server/db/types';
import type { TransactionType } from '@server/transactions/types';
import type { DateFilter } from '@server/types';
import { getDateWhereFromFilter } from '@server/transactions/utils';
import type { TimeGranularity } from './types';

export type RatesByCurrency = Record<string, number>;

export async function getRates(currencies: string[]) {
  const rates = await Promise.all(
    currencies.map(async (currency) => {
      if (currency === 'EUR') {
        return Promise.resolve({ currency, rate: 1 });
      }
      const rate = await db
        .selectFrom('exchangeRate')
        .select(['close'])
        .where('ticker', '=', `EUR${currency}`)
        .orderBy('date', 'desc')
        .executeTakeFirst();
      return rate
        ? {
            currency,
            rate: rate.close,
          }
        : {
            currency,
            rate: 1,
          };
    }),
  );
  return rates.reduce<RatesByCurrency>(
    (acc, rate) => ({ ...acc, [rate.currency]: rate.rate }),
    {},
  );
}

export type TransactionResult = AccountTransaction & {
  account: BankAccount | null;
  category: Category | null;
};

export function convertAmount(
  amount: number,
  currency: string,
  targetCurrency: string,
  rates: RatesByCurrency,
) {
  // To do RON -> USD
  // baseToTarget: EUR -> USD
  // baseToTransaction: EUR -> RON
  const baseToTarget = rates[targetCurrency] || 1;
  const baseToTransaction = rates[currency] || 1;
  return Math.round(((amount * baseToTarget) / baseToTransaction) * 100) / 100;
}

export function getFormatForGranularity(granularity: TimeGranularity) {
  switch (granularity) {
    case 'Daily':
      return 'yyyy-MM-dd';
    case 'Monthly':
      return 'yyyy-MM';
    case 'Quarterly':
      return 'yyyy-qqq';
    case 'Yearly':
      return 'yyyy';
    default:
      return 'yyyy-MM-dd';
  }
}

export function getDisplayFormatForGranularity(granularity: TimeGranularity) {
  switch (granularity) {
    case 'Daily':
      return 'dd MMM yyyy';
    case 'Monthly':
      return 'MMM yyyy';
    case 'Quarterly':
      return 'qqq yyyy';
    case 'Yearly':
      return 'yyyy';
    default:
      return 'dd MMM yyyy';
  }
}

type GetTransactionsQueryInput = {
  type?: TransactionType;
  date?: DateFilter;
  accounts?: number[];
  categories?: number[];
};

export function getTransactionsQuery({
  type,
  date,
  accounts,
  categories,
}: GetTransactionsQueryInput) {
  let query = db
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
      jsonObjectFrom(
        eb
          .selectFrom('category')
          .select([
            'id',
            'name',
            'importPatterns',
            'createdAt',
            'updatedAt',
            'deletedAt',
          ])
          .whereRef('category.id', '=', 'accountTransaction.categoryId'),
      ).as('category'),
    ]);

  if (type) {
    query = query.where('type', '=', type);
  }

  if (accounts) {
    query = query.where('id', 'in', accounts);
  }
  if (categories) {
    query = query.where('categoryId', 'in', categories);
  }
  const dateFilter = getDateWhereFromFilter(date);
  if (dateFilter.gte) {
    const gte =
      typeof dateFilter.gte === 'string'
        ? dateFilter.gte
        : dateFilter.gte.toISOString();
    query = query.where('date', '>=', gte);
  }
  if (dateFilter.lte) {
    const lte =
      typeof dateFilter.lte === 'string'
        ? dateFilter.lte
        : dateFilter.lte.toISOString();
    query = query.where('date', '<=', lte);
  }
  return query;
}
