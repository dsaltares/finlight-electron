import type { NotNull } from 'kysely';
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
    accounts,
    type,
    categories,
    description,
  },
}) => {
  let query = db
    .selectFrom('accountTransaction as t')
    .selectAll()
    .select(({ selectFrom }) =>
      selectFrom('attachment as a')
        .select(({ eb }) => [eb.fn.countAll<number>().as('count')])
        .whereRef('a.transactionId', 'is', 't.id')
        .where('a.deletedAt', 'is not', 'null')
        .as('numAttachments'),
    )
    .where('deletedAt', 'is', null)
    .$narrowType<{ numAttachments: NotNull }>();

  if (accounts && accounts.length > 0) {
    query = query.where('accountId', 'in', accounts);
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

  if (categories && categories.length > 0) {
    query = query.where('categoryId', 'in', categories);
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
