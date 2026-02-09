import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import {
  CreateCSVImportPresetInput,
  CreateCSVImportPresetOutput,
} from './types';

const createCSVImportPreset: Procedure<
  CreateCSVImportPresetInput,
  CreateCSVImportPresetOutput
> = async ({
  input: {
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
    .insertInto('csvImportPreset')
    .values({
      name,
      fields: JSON.stringify(fields),
      dateFormat,
      delimiter,
      decimal,
      rowsToSkipStart,
      rowsToSkipEnd,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

export default procedure
  .input(CreateCSVImportPresetInput)
  .output(CreateCSVImportPresetOutput)
  .mutation(createCSVImportPreset);
