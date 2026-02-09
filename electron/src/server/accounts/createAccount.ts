import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { CreateAccountInput, CreateAccountOutput } from './types';

const createAccount: Procedure<
  CreateAccountInput,
  CreateAccountOutput
> = async ({
  input: { name, initialBalance, currency, csvImportPresetId },
}) => {
  const account = await db
    .selectFrom('bankAccount')
    .select('id')
    .where('name', 'is', name)
    .executeTakeFirst();

  if (account) {
    return db
      .updateTable('bankAccount')
      .set({
        name,
        initialBalance,
        balance: initialBalance,
        currency,
        csvImportPresetId,
        deletedAt: null,
      })
      .where('id', '=', account.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  return db
    .insertInto('bankAccount')
    .values({
      name,
      initialBalance,
      balance: initialBalance,
      currency,
      csvImportPresetId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
};

export default procedure
  .input(CreateAccountInput)
  .output(CreateAccountOutput)
  .mutation(createAccount);
