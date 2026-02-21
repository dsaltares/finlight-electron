import { TRPCError } from '@trpc/server';
import z from 'zod';
import { CategoryColorHexValues } from '@/lib/categoryColors';
import { db } from '@/server/db';
import { authedProcedure } from '../trpc';

const categoryColorHexSet = new Set(CategoryColorHexValues);

const CategoryColorSchema = z
  .string()
  .refine((value) => categoryColorHexSet.has(value), {
    message: 'Invalid category color.',
  });

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  color: CategoryColorSchema,
  importPatterns: z.string().array(),
});

export type Category = z.infer<typeof CategorySchema>;

const listCategories = authedProcedure
  .input(z.void())
  .output(z.array(CategorySchema))
  .query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return await db
      .selectFrom('category')
      .selectAll()
      .where('deletedAt', 'is', null)
      .where('userId', '=', userId)
      .execute();
  });

const createCategory = authedProcedure
  .input(CategorySchema.pick({ name: true, color: true, importPatterns: true }))
  .output(CategorySchema)
  .mutation(async ({ ctx, input }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const updatedDeletedCategory = await db
      .updateTable('category')
      .set({
        deletedAt: null,
        importPatterns: JSON.stringify(input.importPatterns),
        name: input.name,
        color: input.color,
      })
      .where('userId', '=', ctx.user.id)
      .where('name', '=', input.name)
      .where('deletedAt', 'is not', null)
      .returningAll()
      .executeTakeFirst();

    if (updatedDeletedCategory) {
      return updatedDeletedCategory;
    }

    return await db
      .insertInto('category')
      .values({
        userId: ctx.user.id,
        name: input.name,
        color: input.color,
        importPatterns: JSON.stringify(input.importPatterns),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  });

const deleteCategory = authedProcedure
  .input(z.object({ id: z.number() }))
  .output(z.void())
  .mutation(async ({ ctx, input: { id } }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable('category')
        .set({ deletedAt: new Date().toISOString() })
        .where('userId', '=', userId)
        .where('id', '=', id)
        .execute();
      await trx
        .updateTable('account_transaction')
        .set({ categoryId: null })
        .where('categoryId', '=', id)
        .execute();
    });
  });

const updateCategory = authedProcedure
  .input(
    CategorySchema.pick({
      id: true,
      name: true,
      color: true,
      importPatterns: true,
    }),
  )
  .output(CategorySchema)
  .mutation(async ({ ctx, input: { id, name, color, importPatterns } }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return await db
      .updateTable('category')
      .set({ name, color, importPatterns: JSON.stringify(importPatterns) })
      .where('userId', '=', userId)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  });

export default {
  list: listCategories,
  create: createCategory,
  delete: deleteCategory,
  update: updateCategory,
};
