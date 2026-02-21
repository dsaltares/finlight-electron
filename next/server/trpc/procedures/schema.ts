import z from 'zod';

export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected date format YYYY-MM-DD');

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
export const PeriodSchema = z.enum(Periods);

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

export const DateRangeValue = z.union([DateSchema, z.null(), z.undefined()]);
export const DateRangeSchema = z.object({
  from: DateSchema.optional(),
  until: DateSchema.optional(),
});

export const DateFilterSchema = z.union([PeriodSchema, DateRangeSchema]);

export const TransactionTypes = ['Income', 'Expense', 'Transfer'] as const;
export const TransactionTypeSchema = z.enum(TransactionTypes);

export const TimeGranularities = [
  'Daily',
  'Monthly',
  'Quarterly',
  'Yearly',
] as const;
export const TimeGranularitySchema = z.enum(TimeGranularities);

export type DateType = z.infer<typeof DateSchema>;
export type DateFilter = z.infer<typeof DateFilterSchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type Period = z.infer<typeof PeriodSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type TimeGranularity = z.infer<typeof TimeGranularitySchema>;
