import { z } from 'zod';
import { Date } from '../types';

export const ExchangeRate = z.object({
  id: z.number(),
  ticker: z.string(),
  code: z.string(),
  currency: z.string(),
  open: z.number(),
  low: z.number(),
  high: z.number(),
  close: z.number(),
  date: Date,
});

export const GetExchangeRatesInput = z.void();
export const GetExchangeRatesOutput = z.array(ExchangeRate);
export const UpsertExchangeRateInput = z.object({
  ticker: z.string(),
  open: z.number(),
  low: z.number(),
  high: z.number(),
  close: z.number(),
});
export const UpsertExchangeRateOutput = ExchangeRate;
export const RefreshExchangeRateInput = z.void();
export const RefreshExchangeRateOutput = z.void();

export type ExchangeRate = z.infer<typeof ExchangeRate>;
export type GetExchangeRatesInput = z.infer<typeof GetExchangeRatesInput>;
export type GetExchangeRatesOutput = z.infer<typeof GetExchangeRatesOutput>;
export type UpsertExchangeRateInput = z.infer<typeof UpsertExchangeRateInput>;
export type UpsertExchangeRateOutput = z.infer<typeof UpsertExchangeRateOutput>;
export type RefreshExchangeRateInput = z.infer<typeof RefreshExchangeRateInput>;
export type RefreshExchangeRateOutput = z.infer<
  typeof RefreshExchangeRateOutput
>;
