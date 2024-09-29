import { dialog } from 'electron';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { procedure } from '@server/trpc';

const Properties = z.enum([
  'openFile',
  'openDirectory',
  'multiSelections',
  'showHiddenFiles',
  'createDirectory',
  'promptToCreate',
  'noResolveAliases',
  'treatPackageAsDirectory',
  'dontAddToRecent',
]);

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
      properties: z.array(Properties).optional(),
    }),
  )
  .output(z.string())
  .mutation(async ({ input: { title, defaultPath, filters, properties } }) => {
    const result = await dialog.showOpenDialog({
      title,
      defaultPath,
      filters,
      properties,
    });

    if (result.filePaths.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No file selected',
      });
    }

    return result.filePaths[0];
  });
