import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { UpdateExchangeRatesInput, UpdateExchangeRatesOutput } from './types';

const updateExchangeRates: Procedure<
  UpdateExchangeRatesInput,
  UpdateExchangeRatesOutput
> = async ({ input }) => {
  const rates = input.map(({ ticker, close }) => ({
    ticker,
    close,
    open: close,
    low: close,
    high: close,
    date: new Date().toISOString(),
  }));
  await db.transaction().execute(async (trx) => {
    for (const rate of rates) {
      const { ticker, ...rest } = rate;
      await trx
        .insertInto('exchangeRate')
        .values({
          ticker,
          ...rest,
        })
        .onConflict((oc) => oc.column('ticker').doUpdateSet(rest))
        .execute();
    }
  });
};

export default procedure
  .input(UpdateExchangeRatesInput)
  .output(UpdateExchangeRatesOutput)
  .mutation(updateExchangeRates);
