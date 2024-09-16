import currencyCodes from 'currency-codes';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { GetExchangeRatesInput, GetExchangeRatesOutput } from './types';

const getExchangeRates: Procedure<
  GetExchangeRatesInput,
  GetExchangeRatesOutput
> = async () => {
  const rates = await db
    .selectFrom('exchangeRate')
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
};

export default procedure
  .input(GetExchangeRatesInput)
  .output(GetExchangeRatesOutput)
  .query(getExchangeRates);
