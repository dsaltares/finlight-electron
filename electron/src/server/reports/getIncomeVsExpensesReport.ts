import groupBy from 'lodash.groupby';
import { parse } from 'date-fns/parse';
import { format } from 'date-fns/format';
import createUTCDate from '@lib/createUTCDate';
import { type Procedure, procedure } from '@server/trpc';
import {
  GetIncomeVsExpensesReportInput,
  GetIncomeVsExpensesReportOutput,
} from './types';
import {
  getRates,
  convertAmount,
  getFormatForGranularity,
  getDisplayFormatForGranularity,
  getTransactionsQuery,
} from './utils';

const getIncomeVsExpensesReport: Procedure<
  GetIncomeVsExpensesReportInput,
  GetIncomeVsExpensesReportOutput
> = async ({
  input: {
    date,
    accounts,
    currency,
    granularity,
    categories: selectedCategories,
  },
}) => {
  const transactions = await getTransactionsQuery({
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
    .sort()
    .map((bucketKey) => {
      const bucket = buckets[bucketKey];
      const income = bucket
        .filter((transaction) => transaction.type === 'Income')
        .reduce(
          (acc, transaction) =>
            acc +
            convertAmount(
              transaction.amount,
              transaction.account?.currency || 'EUR',
              currency,
              rates,
            ),
          0,
        );
      const expenses = bucket
        .filter((transaction) => transaction.type === 'Expense')
        .reduce(
          (acc, transaction) =>
            acc -
            convertAmount(
              transaction.amount,
              transaction.account?.currency || 'EUR',
              currency,
              rates,
            ),
          0,
        );
      return {
        bucket: format(
          parse(bucketKey, dateFormat, createUTCDate()),
          getDisplayFormatForGranularity(granularity),
        ),
        income,
        expenses,
        difference: income - expenses,
      };
    });
};

export default procedure
  .input(GetIncomeVsExpensesReportInput)
  .output(GetIncomeVsExpensesReportOutput)
  .query(getIncomeVsExpensesReport);
