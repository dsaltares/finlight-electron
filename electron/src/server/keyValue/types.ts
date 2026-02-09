import { z } from 'zod';

export const KeyValuePair = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
});

export const GetKeyValuePairInput = z.object({
  key: z.string(),
});
export const GetKeyValuePairOutput = KeyValuePair.nullable();
export const UpdateKeyValuePairInput = z.object({
  key: z.string(),
  value: z.string(),
});
export const UpdateKeyValuePairOutput = KeyValuePair;

export type KeyValuePair = z.infer<typeof KeyValuePair>;
export type GetKeyValuePairInput = z.infer<typeof GetKeyValuePairInput>;
export type GetKeyValuePairOutput = z.infer<typeof GetKeyValuePairOutput>;
export type UpdateKeyValuePairInput = z.infer<typeof UpdateKeyValuePairInput>;
export type UpdateKeyValuePairOutput = z.infer<typeof UpdateKeyValuePairOutput>;
