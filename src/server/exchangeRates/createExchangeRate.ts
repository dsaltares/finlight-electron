import currencyCodes from 'currency-codes';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import logger from '@server/logger';
import { CreateExchangeRateInput, CreateExchangeRateOutput } from './types';

const createExchangeRate: Procedure<
  CreateExchangeRateInput,
  CreateExchangeRateOutput
> = async ({ input: { ticker, close } }) => {
  logger.info('ticker', ticker);
  logger.info('close', close);
  const inserted = await db
    .insertInto('exchangeRate')
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
};

export default procedure
  .input(CreateExchangeRateInput)
  .output(CreateExchangeRateOutput)
  .mutation(createExchangeRate);
