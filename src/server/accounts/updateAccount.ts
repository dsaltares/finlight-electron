import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { updateAccountBalance } from '@server/transactions/utils';
import { UpdateAccountInput, UpdateAccountOutput } from './types';

const updateAccount: Procedure<
  UpdateAccountInput,
  UpdateAccountOutput
> = async ({
  input: { id, name, initialBalance, currency, csvImportPresetId },
}) => {
  await db
    .selectFrom('bankAccount')
    .select('id')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
  const account = await db
    .updateTable('bankAccount')
    .set({ name, initialBalance, currency, csvImportPresetId, deletedAt: null })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();

  return typeof initialBalance !== 'undefined'
    ? updateAccountBalance(id)
    : account;
};

export default procedure
  .input(UpdateAccountInput)
  .output(UpdateAccountOutput)
  .mutation(updateAccount);
