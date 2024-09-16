import createUTCDate from '@lib/createUTCDate';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import {
  DeleteCSVImportPresetInput,
  DeleteCSVImportPresetOutput,
} from './types';

const deleteCSVImportPreset: Procedure<
  DeleteCSVImportPresetInput,
  DeleteCSVImportPresetOutput
> = async ({ input: { id } }) => {
  await db
    .updateTable('bankAccount')
    .set('csvImportPresetId', null)
    .where('csvImportPresetId', '=', id)
    .execute();
  await db
    .updateTable('csvImportPreset')
    .set('deletedAt', createUTCDate().toISOString())
    .where('id', '=', id)
    .execute();
};

export default procedure
  .input(DeleteCSVImportPresetInput)
  .output(DeleteCSVImportPresetOutput)
  .mutation(deleteCSVImportPreset);
