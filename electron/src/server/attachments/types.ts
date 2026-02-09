import { z } from 'zod';
import { Date } from '../types';

export const AttachmentStatus = z.enum(['OK', 'MISSING']);

export const Attachment = z.object({
  id: z.number(),
  transactionId: z.number(),
  filename: z.string(),
  type: z.string(),
  status: AttachmentStatus,
  createdAt: Date,
});

export const GetAttachmentsInput = z.object({
  transactionId: z.number(),
});
export const GetAttachmentsOutput = z.array(Attachment);

export const CreateAttachmentInput = z.object({
  transactionId: z.number(),
});
export const CreateAttachmentOutput = z.array(Attachment);

export const DeleteAttachmentInput = z.object({
  id: z.number(),
});
export const DeleteAttachmentOutput = z.void();

export type AttachmentStatus = z.infer<typeof AttachmentStatus>;
export type Attachment = z.infer<typeof Attachment>;
export type GetAttachmentsInput = z.infer<typeof GetAttachmentsInput>;
export type GetAttachmentsOutput = z.infer<typeof GetAttachmentsOutput>;
export type CreateAttachmentInput = z.infer<typeof CreateAttachmentInput>;
export type CreateAttachmentOutput = z.infer<typeof CreateAttachmentOutput>;
export type DeleteAttachmentInput = z.infer<typeof DeleteAttachmentInput>;
export type DeleteAttachmentOutput = z.infer<typeof DeleteAttachmentOutput>;
