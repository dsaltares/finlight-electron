import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { GetTransactionsInput, GetTransactionsOutput } from './types';
import { getDateWhereFromFilter } from './utils';

const getTransactions: Procedure<
  GetTransactionsInput,
  GetTransactionsOutput
> = async ({
  input: {
    date,
    minAmount,
    maxAmount,
    accountId,
    type,
    categoryId,
    description,
  },
}) => {
  let query = db
    .selectFrom('accountTransaction')
    .selectAll()
    .where('deletedAt', 'is', null);

  if (accountId) {
    query = query.where('accountId', 'is', accountId);
  }

  const dateFilter = getDateWhereFromFilter(date);
  if (dateFilter.gte) {
    const gte =
      typeof dateFilter.gte === 'string'
        ? dateFilter.gte
        : dateFilter.gte.toISOString();
    query = query.where('date', '>=', gte);
  }
  if (dateFilter.lte) {
    const lte =
      typeof dateFilter.lte === 'string'
        ? dateFilter.lte
        : dateFilter.lte.toISOString();
    query = query.where('date', '<=', lte);
  }

  if (minAmount !== undefined) {
    query = query.where('amount', '>=', minAmount);
  }
  if (maxAmount !== undefined) {
    query = query.where('amount', '<=', maxAmount);
  }

  if (type) {
    query = query.where('type', 'is', type);
  }

  if (categoryId) {
    query = query.where('categoryId', 'is', categoryId);
  }

  if (description) {
    query = query.where('description', 'ilike', `%${description}%`);
  }

  return query.execute();
};

export default procedure
  .input(GetTransactionsInput)
  .output(GetTransactionsOutput)
  .query(getTransactions);
