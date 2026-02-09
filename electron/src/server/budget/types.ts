import { z } from 'zod';
import { Date } from '../types';

export const BudgetEntryTypes = ['Income', 'Expense'] as const;
export const BudgetEntryType = z.enum(BudgetEntryTypes);
export const TimeGranularities = ['Monthly', 'Quarterly', 'Yearly'] as const;
export const TimeGranularity = z.enum(TimeGranularities);

export const BudgetEntry = z.object({
  type: BudgetEntryType,
  categoryId: z.number(),
  categoryName: z.string(),
  target: z.number(),
  actual: z.number(),
});
export const BudgetEntryInput = z.object({
  categoryId: z.number(),
  type: BudgetEntryType,
  target: z.number(),
});
export const Budget = z.object({
  id: z.number(),
  granularity: TimeGranularity,
  entries: z.array(BudgetEntry),
});

export const GetBudgetInput = z.object({
  date: Date.optional(),
  granularity: TimeGranularity.optional(),
  currency: z.string().optional(),
});
export const GetBudgetOutput = Budget;
export const UpdateBudgetInput = z.object({
  granularity: TimeGranularity.optional(),
  currency: z.string().optional(),
  entries: z.array(BudgetEntryInput),
});
export const UpdateBudgetOutput = z.void();

export type BudgetEntryType = z.infer<typeof BudgetEntryType>;
export type TimeGranularity = z.infer<typeof TimeGranularity>;
export type BudgetEntry = z.infer<typeof BudgetEntry>;
export type BudgetEntryInput = z.infer<typeof BudgetEntryInput>;
export type Budget = z.infer<typeof Budget>;
export type GetBudgetInput = z.infer<typeof GetBudgetInput>;
export type GetBudgetOutput = z.infer<typeof GetBudgetOutput>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetInput>;
export type UpdateBudgetOutput = z.infer<typeof UpdateBudgetOutput>;
