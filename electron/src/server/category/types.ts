import { z } from 'zod';

export const Category = z.object({
  id: z.number(),
  name: z.string(),
  importPatterns: z.string().array(),
});

export const GetCategorysInput = z.void();
export const GetCategorysOutput = z.array(Category);
export const CreateCategoryInput = Category.pick({
  name: true,
  importPatterns: true,
});
export const CreateCategoryOutput = Category;
export const UpdateCategoryInput = z.object({
  id: z.number(),
  name: z.string().optional(),
  importPatterns: z.string().array().optional(),
});
export const UpdateCategoryOutput = Category;
export const DeleteCategoryInput = z.object({
  id: z.number(),
});
export const DeleteCategoryOutput = z.void();

export type Category = z.infer<typeof Category>;
export type GetCategorysInput = z.infer<typeof GetCategorysInput>;
export type GetCategorysOutput = z.infer<typeof GetCategorysOutput>;
export type CreateCategoryInput = z.infer<typeof CreateCategoryInput>;
export type CreateCategoryOutput = z.infer<typeof CreateCategoryOutput>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInput>;
export type UpdateCategoryOutput = z.infer<typeof UpdateCategoryOutput>;
export type DeleteCategoryInput = z.infer<typeof DeleteCategoryInput>;
export type DeleteCategoryOutput = z.infer<typeof DeleteCategoryOutput>;
