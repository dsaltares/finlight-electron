import { dialog } from 'electron';
import { z } from 'zod';
import { procedure } from '@server/trpc';

export default procedure
  .input(
    z.object({
      title: z.string().optional(),
      defaultPath: z.string().optional(),
      filters: z
        .array(
          z.object({
            name: z.string(),
            extensions: z.array(z.string()),
          }),
        )
        .optional(),
    }),
  )
  .output(z.string())
  .mutation(async ({ input: { title, defaultPath, filters } }) => {
    const result = await dialog.showSaveDialog({
      title,
      defaultPath,
      filters,
    });

    return result.filePath;
  });
