import fs from 'fs/promises';
import path from 'path';
import { dialog } from 'electron';
import mime from 'mime';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { getUserSettings } from '@server/userSettings/store';
import { getAttachmentsPath } from '@server/userSettings/utils';
import { CreateAttachmentInput, CreateAttachmentOutput } from './types';

const createAttachment: Procedure<
  CreateAttachmentInput,
  CreateAttachmentOutput
> = async ({ input: { transactionId } }) => {
  const settings = await getUserSettings();
  const attachmentsPath = getAttachmentsPath(settings);
  const attachmentPath = path.join(attachmentsPath, `${transactionId}`);
  const exists = await folderExists(attachmentPath);
  if (!exists) {
    await fs.mkdir(attachmentPath, { recursive: true });
  }

  const files = await dialog.showOpenDialog({
    title: 'Attach files',
    properties: ['openFile', 'multiSelections'],
  });

  return Promise.all(
    files.filePaths.map((filePath) =>
      attachFile(transactionId, attachmentPath, filePath),
    ),
  );
};

export default procedure
  .input(CreateAttachmentInput)
  .output(CreateAttachmentOutput)
  .mutation(createAttachment);

async function attachFile(
  transactionId: number,
  attachmentPath: string,
  sourcePath: string,
) {
  const fileName = path.basename(sourcePath);
  const extension = path.extname(fileName);
  await fs.copyFile(sourcePath, path.join(attachmentPath, fileName));

  const attachment = await db
    .insertInto('attachment')
    .values({
      transactionId,
      filename: fileName,
      type: mime.getType(extension) || 'application/octet-stream',
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    ...attachment,
    status: 'OK' as const,
  };
}

async function folderExists(fullPath: string) {
  try {
    const stats = await fs.stat(fullPath);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
}
