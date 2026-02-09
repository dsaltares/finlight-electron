import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import {
  UpdateCSVImportPresetInput,
  UpdateCSVImportPresetOutput,
} from './types';

const updateCSVImportPreset: Procedure<
  UpdateCSVImportPresetInput,
  UpdateCSVImportPresetOutput
> = async ({
  input: {
    id,
    name,
    fields,
    dateFormat,
    delimiter,
    decimal,
    rowsToSkipStart,
    rowsToSkipEnd,
  },
}) =>
  db
    .updateTable('csvImportPreset')
    .set({
      name,
      fields: JSON.stringify(fields),
      dateFormat,
      delimiter,
      decimal,
      rowsToSkipStart,
      rowsToSkipEnd,
      deletedAt: null,
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirstOrThrow();

export default procedure
  .input(UpdateCSVImportPresetInput)
  .output(UpdateCSVImportPresetOutput)
  .mutation(updateCSVImportPreset);
