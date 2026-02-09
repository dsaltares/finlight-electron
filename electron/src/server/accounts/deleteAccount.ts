import createUTCDate from '@lib/createUTCDate';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { DeleteAccountInput, DeleteAccountOutput } from './types';

const deleteAccount: Procedure<
  DeleteAccountInput,
  DeleteAccountOutput
> = async ({ input: { id } }) => {
  await db
    .selectFrom('bankAccount')
    .select('id')
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
  await db
    .updateTable('bankAccount')
    .set({ deletedAt: createUTCDate().toISOString() })
    .where('id', '=', id)
    .execute();
  await db
    .updateTable('accountTransaction')
    .set({ deletedAt: createUTCDate().toISOString() })
    .where('accountId', '=', id)
    .execute();
};

export default procedure
  .input(DeleteAccountInput)
  .output(DeleteAccountOutput)
  .mutation(deleteAccount);
