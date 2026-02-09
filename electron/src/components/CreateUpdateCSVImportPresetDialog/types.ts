import type { CSVImportField } from '@server/csvImportPreset/types';

export type CSVImportPresetFormValues = {
  name: string;
  fields: { id: CSVImportField; value: CSVImportField }[];
  dateFormat: string;
  delimiter: string;
  decimal: string;
  rowsToSkipStart: string;
  rowsToSkipEnd: string;
};
