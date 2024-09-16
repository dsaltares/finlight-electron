import { subDays } from 'date-fns/subDays';
import { startOfYesterday } from 'date-fns/startOfYesterday';
import { isWeekend } from 'date-fns/isWeekend';
import { format } from 'date-fns/format';
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
  const formattedDate = format(date, 'yyyy-MM-dd');
  console.log(`Fetching exchange rates for ${formattedDate}`);

  const keyValue = await db
    .selectFrom('keyValue')
    .selectAll()
    .where('key', '=', PolygonApiKeySettingName)
    .executeTakeFirst();
  if (!keyValue) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Polygon API key not found',
    });
  }

  const rates = await getPolygonRates({
    date,
    apiKey: keyValue.value,
  });

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
