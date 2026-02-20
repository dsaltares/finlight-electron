import { addDays } from 'date-fns/addDays';
import { addMonths } from 'date-fns/addMonths';
import { addYears } from 'date-fns/addYears';
import { endOfMonth } from 'date-fns/endOfMonth';
import { endOfYear } from 'date-fns/endOfYear';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfYear } from 'date-fns/startOfYear';
import {
  type DateFilter,
  type DateRange,
  DateRangeSchema,
  type Period,
  PeriodSchema,
} from '@/server/trpc/procedures/schema';

type GetDateWhereFromFilterArgs = {
  filter: DateFilter | undefined;
  timeZone?: string;
};

export function getDateWhereFromFilter({
  filter,
  timeZone,
}: GetDateWhereFromFilterArgs) {
  if (isDateRange(filter)) {
    return {
      gte: filter?.from || undefined,
      lte: filter?.until || undefined,
    };
  } else if (isPeriod(filter)) {
    const [gte, lte] = getDateRangeForPeriod({ period: filter, timeZone });
    return {
      gte,
      lte,
    };
  }
  return { gte: undefined, lte: undefined };
}

function isDateRange(filter: DateFilter | undefined): filter is DateRange {
  const parsed = DateRangeSchema.safeParse(filter);
  return parsed.success && (!!parsed.data.from || !!parsed.data.until);
}

function isPeriod(filter: DateFilter | undefined): filter is Period {
  const parsed = PeriodSchema.safeParse(filter);
  return parsed.success;
}

type GetDateRangeForPeriodArgs = {
  period: Period;
  timeZone?: string;
};

function getDateRangeForPeriod({
  period,
  timeZone,
}: GetDateRangeForPeriodArgs) {
  const today = parseISO(getTodayInTimeZone(timeZone));
  switch (period) {
    case 'last30Days':
      return [
        format(addDays(today, -30), 'yyyy-MM-dd'),
        format(today, 'yyyy-MM-dd'),
      ];
    case 'last90Days':
      return [
        format(addDays(today, -90), 'yyyy-MM-dd'),
        format(today, 'yyyy-MM-dd'),
      ];
    case 'currentMonth':
      return [
        format(startOfMonth(today), 'yyyy-MM-dd'),
        format(endOfMonth(today), 'yyyy-MM-dd'),
      ];
    case 'lastMonth': {
      const oneMonthAgo = addMonths(today, -1);
      return [
        format(startOfMonth(oneMonthAgo), 'yyyy-MM-dd'),
        format(endOfMonth(oneMonthAgo), 'yyyy-MM-dd'),
      ];
    }
    case 'last3Months': {
      const oneMonthAgo = addMonths(today, -1);
      const threeMonthsAgo = addMonths(today, -3);
      return [
        format(startOfMonth(threeMonthsAgo), 'yyyy-MM-dd'),
        format(endOfMonth(oneMonthAgo), 'yyyy-MM-dd'),
      ];
    }
    case 'currentYear':
      return [
        format(startOfYear(today), 'yyyy-MM-dd'),
        format(endOfYear(today), 'yyyy-MM-dd'),
      ];
    case 'lastYear': {
      const oneYearAgo = addYears(today, -1);
      return [
        format(startOfYear(oneYearAgo), 'yyyy-MM-dd'),
        format(endOfYear(oneYearAgo), 'yyyy-MM-dd'),
      ];
    }
    default:
      return [undefined, undefined];
  }
}

function isValidTimeZone(timeZone: string) {
  try {
    Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getTodayInTimeZone(timeZone?: string) {
  const safeTimeZone = timeZone && isValidTimeZone(timeZone) ? timeZone : 'UTC';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
