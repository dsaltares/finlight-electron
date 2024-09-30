import { shell } from 'electron';
import path from 'path';
import { z } from 'zod';
import { procedure } from '@server/trpc';
import { Attachment } from '@server/attachments/types';
import { getUserSettings } from '@server/userSettings/store';
import { getAttachmentsPath } from '@server/userSettings/utils';

export default procedure
  .input(
    z.object({
      attachment: Attachment,
    }),
  )
  .output(z.void())
  .mutation(async ({ input: { attachment } }) => {
    const settings = await getUserSettings();
    const attachmentsPath = getAttachmentsPath(settings);
    const fullPath = path.join(
      attachmentsPath,
      `${attachment.transactionId}`,
      attachment.filename,
    );
    await shell.openPath(fullPath);
  });
