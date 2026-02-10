export const CSVImportFields = [
  'Date',
  'Amount',
  'Withdrawal',
  'Deposit',
  'Fee',
  'Description',
  'Ignore',
] as const;

export type CSVImportField = (typeof CSVImportFields)[number];
