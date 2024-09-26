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
export const CreateExchangeRateInput = z.object({
  ticker: z.string(),
  close: z.number(),
});
export const CreateExchangeRateOutput = ExchangeRate;
export const UpdateExchangeRatesInput = z.array(
  z.object({
    ticker: z.string(),
    close: z.number(),
  }),
);
export const UpdateExchangeRatesOutput = z.void();
export const RefreshExchangeRateInput = z.void();
export const RefreshExchangeRateOutput = z.void();

export type ExchangeRate = z.infer<typeof ExchangeRate>;
export type GetExchangeRatesInput = z.infer<typeof GetExchangeRatesInput>;
export type GetExchangeRatesOutput = z.infer<typeof GetExchangeRatesOutput>;
export type CreateExchangeRateInput = z.infer<typeof CreateExchangeRateInput>;
export type CreateExchangeRateOutput = z.infer<typeof CreateExchangeRateOutput>;
export type UpdateExchangeRatesInput = z.infer<typeof UpdateExchangeRatesInput>;
export type UpdateExchangeRatesOutput = z.infer<
  typeof UpdateExchangeRatesOutput
>;
export type RefreshExchangeRateInput = z.infer<typeof RefreshExchangeRateInput>;
export type RefreshExchangeRateOutput = z.infer<
  typeof RefreshExchangeRateOutput
>;
