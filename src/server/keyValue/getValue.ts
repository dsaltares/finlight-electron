import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { GetKeyValuePairInput, GetKeyValuePairOutput } from './types';

const getValue: Procedure<
  GetKeyValuePairInput,
  GetKeyValuePairOutput
> = async ({ input: { key } }) =>
  db
    .selectFrom('keyValue')
    .selectAll()
    .where('key', '=', key)
    .executeTakeFirstOrThrow();

export default procedure
  .input(GetKeyValuePairInput)
  .output(GetKeyValuePairOutput)
  .query(getValue);
