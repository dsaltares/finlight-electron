import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { UpdateTransactionsInput, UpdateTransactionsOutput } from './types';
import { updateAccountBalance } from './utils';

const updateTransactions: Procedure<
  UpdateTransactionsInput,
  UpdateTransactionsOutput
> = async ({ input: { ids, amount, date, type, categoryId, description } }) => {
  const transactions = await db
    .updateTable('accountTransaction')
    .set({
      amount,
      date: typeof date === 'string' ? date : date?.toISOString(),
      type,
      categoryId,
      description,
      deletedAt: null,
    })
    .returningAll()
    .where('id', 'in', ids)
    .execute();
  const accountIds = [
    ...new Set(transactions.map((transaction) => transaction.accountId)),
  ];
  for (const accountId of accountIds) {
    await updateAccountBalance(accountId);
  }
};

export default procedure
  .input(UpdateTransactionsInput)
  .output(UpdateTransactionsOutput)
  .mutation(updateTransactions);
