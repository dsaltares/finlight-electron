import { z } from 'zod';
import { Date } from '../types';

export const CSVImportFields = [
  'Date',
  'Amount',
  'Withdrawal',
  'Deposit',
  'Fee',
  'Description',
  'Ignore',
] as const;

export const CSVImportField = z.enum(CSVImportFields);

export const CSVImportPreset = z.object({
  id: z.number(),
  name: z.string(),
  fields: z.array(CSVImportField),
  dateFormat: z.string(),
  delimiter: z.string(),
  decimal: z.string(),
  rowsToSkipStart: z.number(),
  rowsToSkipEnd: z.number(),
  createdAt: Date,
  updatedAt: Date,
});

export const GetCSVImportPresetsInput = z.void();
export const GetCSVImportPresetsOutput = z.array(CSVImportPreset);
export const CreateCSVImportPresetInput = CSVImportPreset.pick({
  name: true,
  fields: true,
  dateFormat: true,
  delimiter: true,
  decimal: true,
  rowsToSkipStart: true,
  rowsToSkipEnd: true,
});
export const CreateCSVImportPresetOutput = CSVImportPreset;
export const UpdateCSVImportPresetInput = z.object({
  id: z.number(),
  name: z.string().optional(),
  fields: z.array(CSVImportField).optional(),
  dateFormat: z.string().optional(),
  delimiter: z.string().optional(),
  decimal: z.string().optional(),
  rowsToSkipStart: z.number().optional(),
  rowsToSkipEnd: z.number().optional(),
});
export const UpdateCSVImportPresetOutput = CSVImportPreset;
export const DeleteCSVImportPresetInput = z.object({
  id: z.number(),
});
export const DeleteCSVImportPresetOutput = z.void();

export type CSVImportField = z.infer<typeof CSVImportField>;
export type CSVImportPreset = z.infer<typeof CSVImportPreset>;
export type GetCSVImportPresetsInput = z.infer<typeof GetCSVImportPresetsInput>;
export type GetCSVImportPresetsOutput = z.infer<
  typeof GetCSVImportPresetsOutput
>;
export type CreateCSVImportPresetInput = z.infer<
  typeof CreateCSVImportPresetInput
>;
export type CreateCSVImportPresetOutput = z.infer<
  typeof CreateCSVImportPresetOutput
>;
export type UpdateCSVImportPresetInput = z.infer<
  typeof UpdateCSVImportPresetInput
>;
export type UpdateCSVImportPresetOutput = z.infer<
  typeof UpdateCSVImportPresetOutput
>;
export type DeleteCSVImportPresetInput = z.infer<
  typeof DeleteCSVImportPresetInput
>;
export type DeleteCSVImportPresetOutput = z.infer<
  typeof DeleteCSVImportPresetOutput
>;
