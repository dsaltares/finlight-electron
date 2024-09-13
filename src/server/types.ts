import { z } from 'zod';

export const Periods = [
  'last30Days',
  'last90Days',
  'currentMonth',
  'lastMonth',
  'last3Months',
  'currentYear',
  'lastYear',
  'allTime',
] as const;
export const PeriodLabels: Record<Period, string> = {
  last30Days: 'Last 30 days',
  last90Days: 'Last 90 days',
  currentMonth: 'Current month',
  lastMonth: 'Last month',
  last3Months: 'Last 3 months',
  currentYear: 'Current year',
  lastYear: 'Last year',
  allTime: 'All time',
};

export const Period = z.enum(Periods);
export const Date = z.union([z.string(), z.date()]);
export const DateRangeValue = z.union([Date, z.null(), z.undefined()]);
export const DateRange = z.object({
  from: DateRangeValue,
  until: DateRangeValue,
});
export const DateFilter = z.union([Period, DateRange]);

export type Period = z.infer<typeof Period>;
export type Date = z.infer<typeof Date>;
export type DateRange = z.infer<typeof DateRange>;
export type DateFilter = z.infer<typeof DateFilter>;

export const isDateRange = (filter?: DateFilter): filter is DateRange => {
  const parsed = DateRange.safeParse(filter);
  return parsed.success && (!!parsed.data.from || !!parsed.data.until);
};

export const isPeriod = (
  filter: string | DateRange | undefined,
): filter is Period => Period.safeParse(filter).success;
