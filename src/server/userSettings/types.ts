import { z } from 'zod';

export const UserSettings = z.object({
  dbPath: z.string(),
});

export const GetUserSettingsInput = z.void();
export const GetUserSettingsOutput = UserSettings;
export const UpdateUserSettingsInput = UserSettings;
export const UpdateUserSettingsOutput = UserSettings;

export type UserSettings = z.infer<typeof UserSettings>;
export type GetUserSettingsInput = z.infer<typeof GetUserSettingsInput>;
export type GetUserSettingsOutput = z.infer<typeof GetUserSettingsOutput>;
export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsInput>;
export type UpdateUserSettingsOutput = z.infer<typeof UpdateUserSettingsOutput>;
