import { z } from 'zod';
import { DateFilter } from '../types';
import { TransactionType } from '@server/transactions/types';

export const TimeGranularities = [
  'Daily',
  'Monthly',
  'Quarterly',
  'Yearly',
] as const;
export const TimeGranularity = z.enum(TimeGranularities);
export const CategoryAggregate = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
});
export const IncomeVsExpensesBucket = z.object({
  bucket: z.string(),
  income: z.number(),
  expenses: z.number(),
  difference: z.number(),
});
export const AccountPositionsBucket = z.object({
  bucket: z.string(),
  positions: z.record(z.number()),
  total: z.number(),
});
export const BalanceForecastBucket = z.object({
  bucket: z.string(),
  balance: z.number().optional(),
  forecast: z.number().optional(),
});
export const CategoryBucket = z.object({
  bucket: z.string(),
  categories: z.record(z.number()),
  total: z.number(),
});

export const GetCategoryReportInput = z.object({
  type: TransactionType,
  date: DateFilter.optional(),
  accounts: z.string().array().optional(),
  currency: z.string().optional().default('EUR'),
  categories: z.string().array().optional(),
});
export const GetCategoryReportOutput = z.object({
  categories: CategoryAggregate.array(),
  total: z.number(),
});
export const GetBucketedCategoryReportInput = z.object({
  type: TransactionType,
  date: DateFilter.optional(),
  accounts: z.string().array().optional(),
  categories: z.string().array().optional(),
  currency: z.string().optional().default('EUR'),
  granularity: TimeGranularity.optional().default('Monthly'),
});
export const GetBucketedCategoryReportOutput = CategoryBucket.array();
export const GetIncomeVsExpensesReportInput = z.object({
  date: DateFilter.optional(),
  accounts: z.string().array().optional(),
  currency: z.string().optional().default('EUR'),
  granularity: TimeGranularity.optional().default('Monthly'),
});
export const GetIncomeVsExpensesReportOutput = IncomeVsExpensesBucket.array();
export const GetAccountPositionsReportInput = z.object({
  date: DateFilter.optional(),
  accounts: z.string().array().optional(),
  currency: z.string().optional().default('EUR'),
  granularity: TimeGranularity.optional().default('Monthly'),
});
export const GetAccountPositionsReportOutput = AccountPositionsBucket.array();
export const GetBalanceForecastReportInput = z.object({
  date: DateFilter.optional(),
  accounts: z.string().array().optional(),
  currency: z.string().optional().default('EUR'),
  granularity: TimeGranularity.optional().default('Monthly'),
});
export const GetBalanceForecastReportOutput = BalanceForecastBucket.array();

export type BalanceForecastBucket = z.infer<typeof BalanceForecastBucket>;
export type TimeGranularity = z.infer<typeof TimeGranularity>;
export type CategoryAggregate = z.infer<typeof CategoryAggregate>;
export type CategoryBucket = z.infer<typeof CategoryBucket>;
export type IncomeVsExpensesBucket = z.infer<typeof IncomeVsExpensesBucket>;
export type AccountPositionsBucket = z.infer<typeof AccountPositionsBucket>;
export type GetCategoryReportInput = z.infer<typeof GetCategoryReportInput>;
export type GetCategoryReportOutput = z.infer<typeof GetCategoryReportOutput>;
export type GetBucketedCategoryReportInput = z.infer<
  typeof GetBucketedCategoryReportInput
>;
export type GetBucketedCategoryReportOutput = z.infer<
  typeof GetBucketedCategoryReportOutput
>;
export type GetIncomeVsExpensesReportInput = z.infer<
  typeof GetIncomeVsExpensesReportInput
>;
export type GetIncomeVsExpensesReportOutput = z.infer<
  typeof GetIncomeVsExpensesReportOutput
>;
export type GetAccountPositionsReportInput = z.infer<
  typeof GetAccountPositionsReportInput
>;
export type GetAccountPositionsReportOutput = z.infer<
  typeof GetAccountPositionsReportOutput
>;
export type GetBalanceForecastReportInput = z.infer<
  typeof GetBalanceForecastReportInput
>;
export type GetBalanceForecastReportOutput = z.infer<
  typeof GetBalanceForecastReportOutput
>;
