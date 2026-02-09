import { type Procedure, procedure } from '@server/trpc';
import { GetCategoryReportInput, GetCategoryReportOutput } from './types';
import {
  type TransactionResult,
  getRates,
  convertAmount,
  getTransactionsQuery,
} from './utils';

const getCategoryReport: Procedure<
  GetCategoryReportInput,
  GetCategoryReportOutput
> = async ({
  input: { type, date, accounts, currency, categories: selectedCategories },
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
  const transactionsByCategory = transactions.reduce<
    Record<number, TransactionResult[]>
  >((acc, transaction) => {
    const categoryId = transaction.categoryId || -1;
    const transactionsForCategory = acc[categoryId] || [];
    return {
      ...acc,
      [categoryId]: [...transactionsForCategory, transaction],
    };
  }, {});
  const categories = Object.entries(transactionsByCategory)
    .map(([categoryId, transactions]) => ({
      id: parseInt(categoryId, 10),
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
    }))
    .sort((a, b) => b.value - a.value);
  return {
    categories,
    total: categories.reduce((acc, category) => acc + category.value, 0),
  };
};

export default procedure
  .input(GetCategoryReportInput)
  .output(GetCategoryReportOutput)
  .query(getCategoryReport);
