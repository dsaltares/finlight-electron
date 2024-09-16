import currencyCodes from 'currency-codes';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import createUTCDate from '@lib/createUTCDate';
import { UpsertExchangeRateInput, UpsertExchangeRateOutput } from './types';

const upsertExchangeRate: Procedure<
  UpsertExchangeRateInput,
  UpsertExchangeRateOutput
> = async ({ input: { ticker, open, close, high, low } }) => {
  const rate = await db
    .insertInto('exchangeRate')
    .values({
      ticker,
      open,
      close,
      high,
      low,
      date: createUTCDate().toISOString(),
    })
    .onConflict((oc) =>
      oc.column('ticker').doUpdateSet({
        open,
        close,
        high,
        low,
        date: createUTCDate().toISOString(),
      }),
    )
    .returningAll()
    .executeTakeFirstOrThrow();

  const data = currencyCodes.code(rate.ticker.replace('EUR', ''));
  return {
    ...rate,
    code: data?.code || '',
    currency: data?.currency || '',
  };
};

export default procedure
  .input(UpsertExchangeRateInput)
  .output(UpsertExchangeRateOutput)
  .mutation(upsertExchangeRate);
