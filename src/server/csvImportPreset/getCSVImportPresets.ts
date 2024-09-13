import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { GetCSVImportPresetsInput, GetCSVImportPresetsOutput } from './types';

const getCSVImportPresets: Procedure<
  GetCSVImportPresetsInput,
  GetCSVImportPresetsOutput
> = async () =>
  db
    .selectFrom('csvImportPreset')
    .selectAll()
    .where('deletedAt', 'is', null)
    .execute();

export default procedure
  .input(GetCSVImportPresetsInput)
  .output(GetCSVImportPresetsOutput)
  .query(getCSVImportPresets);
