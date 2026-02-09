import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { GetCategorysInput, GetCategorysOutput } from './types';

const getCategories: Procedure<
  GetCategorysInput,
  GetCategorysOutput
> = async () =>
  db
    .selectFrom('category')
    .selectAll()
    .where('deletedAt', 'is', null)
    .orderBy('createdAt', 'asc')
    .execute();

export default procedure
  .input(GetCategorysInput)
  .output(GetCategorysOutput)
  .query(getCategories);
