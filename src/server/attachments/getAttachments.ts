import fs from 'fs/promises';
import path from 'path';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { getUserSettings } from '@server/userSettings/store';
import { getAttachmentsPath } from '@server/userSettings/utils';
import type { AttachmentStatus } from './types';
import { GetAttachmentsInput, GetAttachmentsOutput } from './types';

const getAttachments: Procedure<
  GetAttachmentsInput,
  GetAttachmentsOutput
> = async ({ input: { transactionId } }) => {
  const attachments = await db
    .selectFrom('attachment')
    .selectAll()
    .where('transactionId', '=', transactionId)
    .where('deletedAt', 'is not', 'null')
    .execute();

  const settings = getUserSettings();
  const attachmentsPath = getAttachmentsPath(settings);
  const allStatus = await Promise.all(
    attachments.map(async (attachment): Promise<AttachmentStatus> => {
      try {
        const fullPath = path.join(
          attachmentsPath,
          `${attachment.transactionId}`,
          attachment.filename,
        );
        await fs.stat(fullPath);
        return 'OK';
      } catch (_e) {
        return 'MISSING';
      }
    }),
  );
  return attachments.map((attachment, index) => ({
    ...attachment,
    status: allStatus[index],
  }));
};

export default procedure
  .input(GetAttachmentsInput)
  .output(GetAttachmentsOutput)
  .query(getAttachments);
