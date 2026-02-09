import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { UpdateCategoryInput, UpdateCategoryOutput } from './types';

const updateCategory: Procedure<
  UpdateCategoryInput,
  UpdateCategoryOutput
> = async ({ input: { id, name, importPatterns } }) =>
  db
    .updateTable('category')
    .set({
      name,
      importPatterns: JSON.stringify(importPatterns),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();

export default procedure
  .input(UpdateCategoryInput)
  .output(UpdateCategoryOutput)
  .mutation(updateCategory);
