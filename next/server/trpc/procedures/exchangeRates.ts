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

const createExchangeRate = authedProcedure
  .input(
    z.object({
      ticker: z.string(),
      close: z.number(),
    }),
  )
  .output(ExchangeRateSchema)
  .mutation(async ({ input: { ticker, close } }) => {
    const inserted = await db
      .insertInto('exchange_rate')
      .values({
        ticker,
        close,
        open: close,
        low: close,
        high: close,
        date: new Date().toISOString(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    const data = currencyCodes.code(inserted.ticker.replace('EUR', ''));
    return {
      ...inserted,
      code: data?.code || '',
      currency: data?.currency || '',
    };
  });

const refreshExchangeRates = authedProcedure
  .input(z.void())
  .output(z.void())
  .mutation(async () => {
    await refreshRates();
  });

const updateExchangeRates = authedProcedure
  .input(
    z.array(
      z.object({
        ticker: z.string(),
        close: z.number(),
      }),
    ),
  )
  .output(z.void())
  .mutation(async ({ input: rates }) => {
    await db.transaction().execute(async (trx) => {
      for (const { ticker, close } of rates) {
        const rest = {
          close,
          open: close,
          low: close,
          high: close,
          date: new Date().toISOString(),
        };
        await trx
          .insertInto('exchange_rate')
          .values({
            ticker,
            ...rest,
          })
          .onConflict((oc) => oc.column('ticker').doUpdateSet(rest))
          .execute();
      }
    });
  });

export default {
  list: listExchangeRates,
  create: createExchangeRate,
  refresh: refreshExchangeRates,
  update: updateExchangeRates,
};
