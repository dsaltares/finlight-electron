import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { CreateCategoryInput, CreateCategoryOutput } from './types';

const createCategory: Procedure<
  CreateCategoryInput,
  CreateCategoryOutput
> = async ({ input: { name, importPatterns } }) => {
  const category = await db
    .selectFrom('category')
    .select('id')
    .where('name', '=', name)
    .where('deletedAt', 'is not', null)
    .executeTakeFirst();

  if (category) {
    return db
      .updateTable('category')
      .set({
        name,
        importPatterns: JSON.stringify(importPatterns),
        deletedAt: null,
      })
      .where('id', '=', category.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  return db
    .insertInto('category')
    .values({ name, importPatterns: JSON.stringify(importPatterns) })
    .returningAll()
    .executeTakeFirstOrThrow();
};

export default procedure
  .input(CreateCategoryInput)
  .output(CreateCategoryOutput)
  .mutation(createCategory);
