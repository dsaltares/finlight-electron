import db from '@server/db';
import type {
  AccountTransaction,
  BankAccount,
  Category,
} from '@server/db/types';
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
  account: BankAccount;
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
