import { type ChangeEventHandler, useCallback, useMemo, useRef } from 'react';
import { parse } from 'csv-parse/browser/esm/sync';
import { parse as parseDateBase } from 'date-fns/parse';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import createUTCDate from '@lib/createUTCDate';
import Routes from '@lib/routes';
import client from '@lib/client';
import type {
  CSVImportField,
  CSVImportPreset,
} from '@server/csvImportPreset/types';
import type { Account } from '@server/accounts/types';

const useImportTransactions = (account: Account) => {
  const navigate = useNavigate();
  const { mutateAsync: createTransactions, isPending } =
    client.createTransactions.useMutation({
      onSuccess: (numTransactions: number) => {
        enqueueSnackbar({
          message: `Imported ${numTransactions} transactions.`,
          variant: 'success',
        });
      },
      onError: (e) => {
        enqueueSnackbar({
          message: `Failed to import transactions. ${e.message}`,
          variant: 'error',
        });
      },
    });
  const { data: presets } = client.getCSVImportPresets.useQuery();
  const { data: categories } = client.getCategories.useQuery();
  const preset = useMemo(
    () => presets?.find((preset) => preset.id === account.csvImportPresetId),
    [presets, account.csvImportPresetId],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileUploaded = useCallback(
    async (csv: string) => {
      if (!preset) {
        return;
      }

      try {
        const splitCSV = csv.split('\n');
        const joinedCSV = splitCSV
          .slice(preset.rowsToSkipStart, splitCSV.length - preset.rowsToSkipEnd)
          .join('\n');
        const records = parse(joinedCSV, {
          skip_empty_lines: false,
          delimiter: preset.delimiter || ',',
        }) as string[][];

        const dateIndex = preset.fields.indexOf('Date');
        const descriptionIndex = preset.fields.indexOf('Description');

        const transactions = records.map((record) => {
          const description = record[descriptionIndex] || '';
          const amount = parseNumericField(record, preset, 'Amount');
          const fee = parseNumericField(record, preset, 'Fee');
          const deposit = parseNumericField(record, preset, 'Deposit');
          const withdrawal = parseNumericField(record, preset, 'Withdrawal');
          const actualAmount = deposit || -Math.abs(withdrawal) || amount;

          return {
            date: parseDate(record[dateIndex], preset.dateFormat),
            description,
            amount: actualAmount - fee,
            categoryId:
              categories?.find((category) =>
                category.importPatterns.some((pattern) =>
                  description.toLowerCase().includes(pattern.toLowerCase()),
                ),
              )?.id || null,
          };
        });

        await createTransactions({
          accountId: account.id,
          transactions,
        });
        navigate(Routes.transactionsForAccount(account.id));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },
    [preset, categories, createTransactions, account.id, navigate],
  );
  const handleFileSelected: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      const reader = new FileReader();
      reader.onloadend = () => handleFileUploaded(reader.result as string);
      if (file) {
        reader.readAsText(file);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [handleFileUploaded],
  );

  return {
    fileInputRef,
    isPending,
    handleUploadClick,
    handleFileSelected,
    canImport: !!preset,
  };
};

export default useImportTransactions;

const parseNumericField = (
  record: string[],
  preset: CSVImportPreset,
  fieldName: CSVImportField,
) => {
  const fieldIndex = preset.fields.indexOf(fieldName);
  let amountStr = fieldIndex > -1 ? record[fieldIndex] : '0';
  if (preset.decimal === '.') {
    amountStr = amountStr.replace(',', '');
  } else if (preset.decimal === ',') {
    amountStr = amountStr.replace('.', '').replace(',', '.');
  }
  return parseFloat(amountStr);
};

const parseDate = (dateStr: string, dateFormat: string) => {
  const date = parseDateBase(dateStr, dateFormat, createUTCDate());
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  );
};
