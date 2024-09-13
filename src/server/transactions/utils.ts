import { addDays } from 'date-fns/addDays';
import { addMonths } from 'date-fns/addMonths';
import { addYears } from 'date-fns/addYears';
import { endOfMonth } from 'date-fns/endOfMonth';
import { endOfYear } from 'date-fns/endOfYear';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfToday } from 'date-fns/startOfToday';
import { startOfYear } from 'date-fns/startOfYear';
import createUTCDate from '@lib/createUTCDate';
import { isDateRange, isPeriod } from '@server/types';
import type { DateFilter, Period } from '@server/types';
import db from '@server/db';

export async function updateAccountBalance(accountId: number) {
  const account = await db
    .selectFrom('bankAccount')
    .select('initialBalance')
    .where('id', '=', accountId)
    .executeTakeFirstOrThrow();
  const transactions = await db
    .selectFrom('accountTransaction')
    .select('amount')
    .where('accountId', '=', accountId)
    .execute();
  return db
    .updateTable('bankAccount')
    .set({
      balance:
        Math.round(
          transactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            account.initialBalance,
          ) * 100,
        ) / 100,
    })
    .where('id', '=', accountId)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export function getDateWhereFromFilter(date: DateFilter | undefined) {
  if (isDateRange(date)) {
    return {
      gte: date?.from || undefined,
      lte: date?.until || undefined,
    };
  } else if (isPeriod(date)) {
    const [gte, lte] = getDateRangeForPeriod(date);
    return {
      gte,
      lte,
    };
  }
  return { gte: undefined, lte: undefined };
}

function getDateRangeForPeriod(period: Period | '') {
  const now = createUTCDate();
  const today = startOfToday();
  switch (period) {
    case 'last30Days':
      return [addDays(today, -30), now];
    case 'last90Days':
      return [addDays(today, -90), now];
    case 'currentMonth':
      return [startOfMonth(now), endOfMonth(now)];
    case 'lastMonth': {
      const oneMonthAgo = addMonths(now, -1);
      return [startOfMonth(oneMonthAgo), endOfMonth(oneMonthAgo)];
    }
    case 'last3Months': {
      const oneMonthAgo = addMonths(now, -1);
      const threeMonthsAgo = addMonths(now, -3);
      return [startOfMonth(threeMonthsAgo), endOfMonth(oneMonthAgo)];
    }
    case 'currentYear':
      return [startOfYear(now), endOfYear(now)];
    case 'lastYear': {
      const oneYearAgo = addYears(now, -1);
      return [startOfYear(oneYearAgo), endOfYear(oneYearAgo)];
    }
    default:
      return [undefined, undefined];
  }
}

export default getDateRangeForPeriod;
