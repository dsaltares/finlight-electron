import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { CreateTransactionsInput, CreateTransactionsOutput } from './types';
import { updateAccountBalance } from './utils';

const createTransactions: Procedure<
  CreateTransactionsInput,
  CreateTransactionsOutput
> = async ({ input: { accountId, transactions: data } }) => {
  await db
    .selectFrom('bankAccount')
    .select('id')
    .where('id', '=', accountId)
    .executeTakeFirstOrThrow();
  const transactions = await db
    .insertInto('accountTransaction')
    .values(
      data.map(({ amount, date, description, categoryId }) => ({
        accountId,
        amount,
        date: typeof date === 'string' ? date : date.toISOString(),
        description,
        categoryId,
        type: 'Expense',
      })),
    )
    .returningAll()
    .execute();
  await updateAccountBalance(accountId);
  return transactions.length;
};

export default procedure
  .input(CreateTransactionsInput)
  .output(CreateTransactionsOutput)
  .mutation(createTransactions);
