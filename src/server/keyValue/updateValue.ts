import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { UpdateKeyValuePairInput, UpdateKeyValuePairOutput } from './types';

const updateValue: Procedure<
  UpdateKeyValuePairInput,
  UpdateKeyValuePairOutput
> = async ({ input: { key, value } }) =>
  db
    .insertInto('keyValue')
    .values({ key, value })
    .onConflict((oc) => oc.column('key').doUpdateSet({ value }))
    .returningAll()
    .executeTakeFirstOrThrow();

export default procedure
  .input(UpdateKeyValuePairInput)
  .output(UpdateKeyValuePairOutput)
  .mutation(updateValue);
