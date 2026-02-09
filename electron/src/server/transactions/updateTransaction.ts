import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { UpdateTransactionInput, UpdateTransactionOutput } from './types';
import { getNumAttachments, updateAccountBalance } from './utils';

const updateTransaction: Procedure<
  UpdateTransactionInput,
  UpdateTransactionOutput
> = async ({ input: { id, amount, date, type, categoryId, description } }) => {
  const transaction = await db
    .updateTable('accountTransaction')
    .set({
      amount,
      date: typeof date === 'string' ? date : date?.toISOString(),
      type,
      categoryId,
      description,
    })
    .returningAll()
    .where('id', 'is', id)
    .executeTakeFirstOrThrow();

  const [_account, numAttachments] = await Promise.all([
    updateAccountBalance(transaction.accountId),
    getNumAttachments(transaction.id),
  ]);

  return { ...transaction, numAttachments };
};

export default procedure
  .input(UpdateTransactionInput)
  .output(UpdateTransactionOutput)
  .mutation(updateTransaction);
