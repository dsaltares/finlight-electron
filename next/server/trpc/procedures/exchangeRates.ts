import currencyCodes from 'currency-codes';
import { z } from 'zod';
import { db } from '@/server/db';
import { refreshRates } from '@/server/polygon';
import { authedProcedure } from '@/server/trpc/trpc';

export const ExchangeRateSchema = z.object({
  id: z.number(),
  ticker: z.string(),
  code: z.string(),
  currency: z.string(),
  open: z.number(),
  low: z.number(),
  high: z.number(),
  close: z.number(),
  date: z.coerce.date(),
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

const listExchangeRates = authedProcedure
  .input(z.void())
  .output(z.array(ExchangeRateSchema))
  .query(async () => {
    const rates = await db
      .selectFrom('exchange_rate')
      .selectAll()
      .orderBy('ticker', 'asc')
      .execute();
    return rates.map((rate) => {
      const data = currencyCodes.code(rate.ticker.replace('EUR', ''));
      return {
        ...rate,
        code: data?.code || '',
        currency: data?.currency || '',
      };
    });
  });

const refreshExchangeRates = authedProcedure
  .input(z.void())
  .output(z.void())
  .mutation(async () => {
    await refreshRates();
  });

export default {
  list: listExchangeRates,
  refresh: refreshExchangeRates,
};
