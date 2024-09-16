import createUTCDate from '@lib/createUTCDate';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { DeleteCategoryInput, DeleteCategoryOutput } from './types';

const deleteCategory: Procedure<
  DeleteCategoryInput,
  DeleteCategoryOutput
> = async ({ input: { id } }) => {
  await Promise.all([
    db
      .updateTable('category')
      .set('deletedAt', createUTCDate().toISOString())
      .where('id', '=', id)
      .execute(),
    db
      .updateTable('accountTransaction')
      .set('categoryId', null)
      .where('categoryId', '=', id)
      .execute(),
    db.deleteFrom('budgetEntry').where('categoryId', '=', id).execute(),
  ]);
};

export default procedure
  .input(DeleteCategoryInput)
  .output(DeleteCategoryOutput)
  .mutation(deleteCategory);
