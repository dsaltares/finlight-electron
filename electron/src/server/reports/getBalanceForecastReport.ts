import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
import { parse } from 'date-fns/parse';
import { addYears } from 'date-fns/addYears';
import { addQuarters } from 'date-fns/addQuarters';
import { addMonths } from 'date-fns/addMonths';
import createUTCDate from '@lib/createUTCDate';
import { type Procedure, procedure } from '@server/trpc';
import type { BalanceForecastBucket, TimeGranularity } from './types';
import {
  GetBalanceForecastReportInput,
  GetBalanceForecastReportOutput,
} from './types';
import { getAccountBalancesReportRaw } from './getAccountBalancesReport';
import { getDisplayFormatForGranularity } from './utils';

const getBalanceForecastReport: Procedure<
  GetBalanceForecastReportInput,
  GetBalanceForecastReportOutput
> = async ({
  input: { date, accounts: selectedAccounts, currency, granularity },
}) => {
  const accountBalancesReport = await getAccountBalancesReportRaw({
    input: {
      date,
      accounts: selectedAccounts,
      currency,
      granularity,
    },
  });
  const averageDelta =
    accountBalancesReport.length === 1
      ? 0
      : accountBalancesReport
          .map((bucket) => bucket.total)
          .slice(1)
          .map((balance, index) => balance - accountBalancesReport[index].total)
          .reduce((acc, delta) => acc + delta, 0) /
          accountBalancesReport.length -
        1;
  const buckets: BalanceForecastBucket[] = accountBalancesReport.map(
    ({ bucket, total }, index) => ({
      bucket,
      balance: total,
      forecast: accountBalancesReport[0].total + averageDelta * index,
    }),
  );
  const forecastBuckets: BalanceForecastBucket[] = getEmptyForecastBuckets(
    buckets[buckets.length - 1].bucket,
    granularity,
  ).map(({ bucket }, index) => ({
    bucket,
    forecast: Math.max(
      0,
      (buckets[buckets.length - 1]?.balance || 0) + averageDelta * index,
    ),
  }));

  return [...buckets, ...forecastBuckets];
};

export default procedure
  .input(GetBalanceForecastReportInput)
  .output(GetBalanceForecastReportOutput)
  .query(getBalanceForecastReport);

const getEmptyForecastBuckets = (
  lastRealBucket: string,
  granularity: TimeGranularity,
) => {
  const lastRealDate = parse(
    lastRealBucket,
    getDisplayFormatForGranularity(granularity),
    createUTCDate(),
  );
  const numBuckets =
    granularity === 'Daily'
      ? 31
      : granularity === 'Monthly'
        ? 12
        : granularity === 'Quarterly'
          ? 9
          : 6;
  const addFn =
    granularity === 'Daily'
      ? addDays
      : granularity === 'Monthly'
        ? addMonths
        : granularity === 'Quarterly'
          ? addQuarters
          : addYears;

  return Array.from(Array(numBuckets)).map((_, index) => ({
    bucket: format(
      addFn(lastRealDate, index),
      getDisplayFormatForGranularity(granularity),
    ),
  }));
};
