import path from 'path';
import fs from 'fs/promises';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { getUserSettings } from '@server/userSettings/store';
import { getAttachmentsPath } from '@server/userSettings/utils';
import { fileExists } from '@server/utils';
import { DeleteAttachmentInput, DeleteAttachmentOutput } from './types';

const deleteAttachment: Procedure<
  DeleteAttachmentInput,
  DeleteAttachmentOutput
> = async ({ input: { id } }) => {
  const attachment = await db
    .selectFrom('attachment')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!attachment) {
    return;
  }

  const settings = await getUserSettings();
  const attachmentsPath = getAttachmentsPath(settings);
  const fullPath = path.join(
    attachmentsPath,
    `${attachment.transactionId}`,
    attachment.filename,
  );

  await db.transaction().execute(async (trx) => {
    const exists = await fileExists(fullPath);
    if (exists) {
      await fs.unlink(fullPath);
    }
    await trx.deleteFrom('attachment').where('id', '=', id).execute();
  });
};

export default procedure
  .input(DeleteAttachmentInput)
  .output(DeleteAttachmentOutput)
  .mutation(deleteAttachment);
