import groupBy from 'lodash.groupby';
import { parse } from 'date-fns/parse';
import { format } from 'date-fns/format';
import { type Procedure, procedure } from '@server/trpc';
import createUTCDate from '@lib/createUTCDate';
import {
  GetBucketedCategoryReportInput,
  GetBucketedCategoryReportOutput,
} from './types';
import {
  type TransactionResult,
  getRates,
  convertAmount,
  getFormatForGranularity,
  getDisplayFormatForGranularity,
  getTransactionsQuery,
} from './utils';

const getBucketedCategoryReport: Procedure<
  GetBucketedCategoryReportInput,
  GetBucketedCategoryReportOutput
> = async ({
  input: {
    type,
    date,
    accounts,
    categories: selectedCategories,
    currency,
    granularity,
  },
}) => {
  const transactions = await getTransactionsQuery({
    type,
    date,
    accounts,
    categories: selectedCategories,
  }).execute();

  const rates = await getRates(
    Array.from(
      new Set([
        ...transactions.map(
          (transaction) => transaction.account?.currency || 'EUR',
        ),
        currency,
      ]),
    ),
  );
  const dateFormat = getFormatForGranularity(granularity);
  const buckets = groupBy(transactions, (transaction) =>
    format(transaction.date, dateFormat),
  );

  return Object.keys(buckets)
    .sort((a, b) => a.localeCompare(b))
    .map((bucketKey) => {
      const transactionsByCategory = buckets[bucketKey].reduce<
        Record<string, TransactionResult[]>
      >((acc, transaction) => {
        const categoryId = transaction.categoryId || 'unknown';
        const transactionsForCategory = acc[categoryId] || [];
        return {
          ...acc,
          [categoryId]: [...transactionsForCategory, transaction],
        };
      }, {});
      const categories = Object.values(transactionsByCategory).map(
        (transactions) => ({
          name: transactions[0].category?.name || 'Unknown',
          value: Math.abs(
            transactions.reduce(
              (acc, transaction) =>
                acc +
                convertAmount(
                  transaction.amount,
                  transaction.account?.currency || 'EUR',
                  currency,
                  rates,
                ),
              0,
            ),
          ),
        }),
      );

      return {
        bucket: format(
          parse(bucketKey, dateFormat, createUTCDate()),
          getDisplayFormatForGranularity(granularity),
        ),
        categories: categories.reduce<Record<string, number>>(
          (acc, category) => ({
            ...acc,
            [category.name]: category.value,
          }),
          {},
        ),
        total: categories.reduce((acc, category) => acc + category.value, 0),
      };
    });
};

export default procedure
  .input(GetBucketedCategoryReportInput)
  .output(GetBucketedCategoryReportOutput)
  .query(getBucketedCategoryReport);
