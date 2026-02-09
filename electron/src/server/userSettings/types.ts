import { z } from 'zod';

export const UserSettingsFile = z.object({
  version: z.number(),
  settings: z.any(),
});

const UserSettingsV1 = z.object({
  dataPath: z.string(),
  currency: z.string().optional(),
});

export const UserSettings = UserSettingsV1;

export const GetUserSettingsInput = z.void();
export const GetUserSettingsOutput = UserSettings;
export const UpdateUserSettingsInput = UserSettings;
export const UpdateUserSettingsOutput = UserSettings;

export type UserSettingsFile = z.infer<typeof UserSettingsFile>;
export type UserSettings = z.infer<typeof UserSettings>;
export type GetUserSettingsInput = z.infer<typeof GetUserSettingsInput>;
export type GetUserSettingsOutput = z.infer<typeof GetUserSettingsOutput>;
export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsInput>;
export type UpdateUserSettingsOutput = z.infer<typeof UpdateUserSettingsOutput>;
