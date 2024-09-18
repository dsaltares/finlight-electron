import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { GetKeyValuePairInput, GetKeyValuePairOutput } from './types';

const getValue: Procedure<
  GetKeyValuePairInput,
  GetKeyValuePairOutput
> = async ({ input: { key } }) => {
  const keyValue = await db
    .selectFrom('keyValue')
    .selectAll()
    .where('key', '=', key)
    .executeTakeFirst();
  return keyValue || null;
};

export default procedure
  .input(GetKeyValuePairInput)
  .output(GetKeyValuePairOutput)
  .query(getValue);
