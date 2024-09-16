import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { CreateTransactionInput, CreateTransactionOutput } from './types';
import { updateAccountBalance } from './utils';

const createTransaction: Procedure<
  CreateTransactionInput,
  CreateTransactionOutput
> = async ({
  input: { amount, date, description, accountId, type, categoryId },
}) => {
  await db
    .selectFrom('bankAccount')
    .select('id')
    .where('id', '=', accountId)
    .executeTakeFirstOrThrow();
  const transaction = await db
    .insertInto('accountTransaction')
    .values({
      amount,
      date: typeof date === 'string' ? date : date.toISOString(),
      description,
      accountId,
      type,
      categoryId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  await updateAccountBalance(accountId);
  return transaction;
};

export default procedure
  .input(CreateTransactionInput)
  .output(CreateTransactionOutput)
  .mutation(createTransaction);
