import createUTCDate from '@lib/createUTCDate';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { DeleteTransactionsInput, DeleteTransactionsOutput } from './types';
import { updateAccountBalance } from './utils';

const deleteTransactions: Procedure<
  DeleteTransactionsInput,
  DeleteTransactionsOutput
> = async ({ input: { ids } }) => {
  const rows = await db
    .selectFrom('accountTransaction')
    .select('accountId')
    .where('id', 'in', ids)
    .execute();
  const accountIds = [...new Set(rows.map((row) => row.accountId))];
  await db
    .updateTable('accountTransaction')
    .set({
      deletedAt: createUTCDate().toISOString(),
    })
    .where('id', 'in', ids)
    .execute();

  for (const accountId of accountIds) {
    await updateAccountBalance(accountId);
  }
};

export default procedure
  .input(DeleteTransactionsInput)
  .output(DeleteTransactionsOutput)
  .mutation(deleteTransactions);
