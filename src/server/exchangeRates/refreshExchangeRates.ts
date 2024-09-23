import { subDays } from 'date-fns/subDays';
import { startOfYesterday } from 'date-fns/startOfYesterday';
import { isWeekend } from 'date-fns/isWeekend';
import { TRPCError } from '@trpc/server';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import getPolygonRates, {
  PolygonApiKeySettingName,
} from '@lib/getPolygonRates';
import { RefreshExchangeRateInput, RefreshExchangeRateOutput } from './types';

const refreshExchangeRate: Procedure<
  RefreshExchangeRateInput,
  RefreshExchangeRateOutput
> = async () => {
  const date = getLastWeekday();
  console.log(`Fetching exchange rates for ${date}`);

  const polygonApiKey = await db
    .selectFrom('keyValue')
    .selectAll()
    .where('key', '=', PolygonApiKeySettingName)
    .executeTakeFirst();
  if (!polygonApiKey) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Polygon API key not found',
    });
  }

  await refreshRates(date, polygonApiKey.value);
};

export default procedure
  .input(RefreshExchangeRateInput)
  .output(RefreshExchangeRateOutput)
  .mutation(refreshExchangeRate);

function getLastWeekday() {
  let date = startOfYesterday();
  while (isWeekend(date)) {
    date = subDays(date, 1);
  }
  return date;
}

async function refreshRates(date: Date, apiKey: string) {
  const rates = await getPolygonRates({ date, apiKey });

  await db.transaction().execute(async (trx) => {
    for (const rate of rates) {
      const { ticker, date, ...rest } = rate;
      await trx
        .insertInto('exchangeRate')
        .values({
          ...rest,
          ticker,
          date: date.toISOString(),
        })
        .onConflict((oc) =>
          oc.column('ticker').doUpdateSet({
            ...rest,
            date: date.toISOString(),
          }),
        )
        .execute();
    }
  });
}
