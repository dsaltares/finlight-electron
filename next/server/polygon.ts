import { format } from 'date-fns/format';
import { isWeekend } from 'date-fns/isWeekend';
import { startOfYesterday } from 'date-fns/startOfYesterday';
import { subDays } from 'date-fns/subDays';
import z from 'zod';
import { db } from './db';
import { getLogger } from './logger';

const logger = getLogger('polygon');

const PolygonGroupedDailyFX = z.object({
  adjusted: z.boolean(),
  count: z.number().optional(),
  queryCount: z.number(),
  resultsCount: z.number(),
  status: z.literal('OK'),
  request_id: z.string(),
  results: z
    .array(
      z.object({
        T: z.string(),
        c: z.number(),
        h: z.number(),
        l: z.number(),
        n: z.number(),
        o: z.number(),
        t: z.number(),
        v: z.number(),
        vw: z.number().optional(),
      }),
    )
    .optional(),
});

export async function refreshRates() {
  const date = getLastWeekday();
  logger.info(`Fetching exchange rates for ${date}`);
  const rates = await getRates(date);

  await db.transaction().execute(async (trx) => {
    for (const rate of rates) {
      const { ticker, date, ...rest } = rate;
      await trx
        .insertInto('exchange_rate')
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

async function getRates(date: Date) {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await fetch(
    `https://api.polygon.io/v2/aggs/grouped/locale/global/market/fx/${formattedDate}?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`,
  );
  const rates = (
    PolygonGroupedDailyFX.parse(await response.json()).results || []
  )
    .filter((rate) => rate.T.split(':')[1].startsWith('EUR'))
    .map((rate) => ({
      ticker: rate.T.split(':')[1],
      date,
      open: rate.o,
      high: rate.h,
      low: rate.l,
      close: rate.c,
    }));
  return rates;
}

function getLastWeekday() {
  let date = startOfYesterday();
  while (isWeekend(date)) {
    date = subDays(date, 1);
  }
  return date;
}
