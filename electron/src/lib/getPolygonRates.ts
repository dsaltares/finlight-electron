import { format } from 'date-fns/format';
import { z } from 'zod';

export const PolygonApiKeySettingName = 'polygonApiKey';

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

type GetPolygonRatesInput = {
  date: Date;
  apiKey: string;
};

export default async function getPolygonRates({
  date,
  apiKey,
}: GetPolygonRatesInput) {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const response = await fetch(
    `https://api.polygon.io/v2/aggs/grouped/locale/global/market/fx/${formattedDate}?adjusted=true&apiKey=${apiKey}`,
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
