import { z } from 'zod';
import { Date } from '../types';

export const Amount = z.object({
  value: z.number(),
  currency: z.string(),
});

export const Account = z.object({
  id: z.number(),
  name: z.string(),
  initialBalance: z.number(),
  balance: z.number(),
  currency: z.string(),
  csvImportPresetId: z.number().nullable(),
  createdAt: Date,
  updatedAt: Date,
});

export const GetAccountsInput = z.void();
export const GetAccountsOutput = z.object({
  accounts: z.array(Account),
  total: Amount,
});
export const CreateAccountInput = Account.pick({
  name: true,
  initialBalance: true,
  currency: true,
  csvImportPresetId: true,
});
export const CreateAccountOutput = Account;
export const UpdateAccountInput = z.object({
  id: z.number(),
  name: z.string().optional(),
  initialBalance: z.number().optional(),
  currency: z.string().optional(),
  csvImportPresetId: z.number().nullable().optional(),
});
export const UpdateAccountOutput = Account;
export const DeleteAccountInput = z.object({
  id: z.number(),
});
export const DeleteAccountOutput = z.void();

export type Account = z.infer<typeof Account>;
export type GetAccountsInput = z.infer<typeof GetAccountsInput>;
export type GetAccountsOutput = z.infer<typeof GetAccountsOutput>;
export type CreateAccountInput = z.infer<typeof CreateAccountInput>;
export type CreateAccountOutput = z.infer<typeof CreateAccountOutput>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountInput>;
export type UpdateAccountOutput = z.infer<typeof UpdateAccountOutput>;
export type DeleteAccountInput = z.infer<typeof DeleteAccountInput>;
export type DeleteAccountOutput = z.infer<typeof DeleteAccountOutput>;
