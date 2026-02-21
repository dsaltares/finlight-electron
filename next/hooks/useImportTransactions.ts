import { useMutation, useQuery } from '@tanstack/react-query';
import { format as formatDate } from 'date-fns/format';
import { parse as parseDate } from 'date-fns/parse';
import Papa from 'papaparse';
import { type ChangeEventHandler, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import type { CSVImportField } from '@/lib/importPresets';
import { type RouterOutput, useTRPC } from '@/lib/trpc';
import type { CSVImportPreset } from '@/server/trpc/procedures/importPresets';

type Account = RouterOutput['accounts']['list']['accounts'][number];

export default function useImportTransactions(account: Account) {
  const trpc = useTRPC();
  const { mutateAsync: createTransactions, isPending } = useMutation(
    trpc.transactions.createMany.mutationOptions({
      onSuccess: (count: number) => {
        toast.success(`Imported ${count} transactions.`);
      },
      onError: (e) => {
        toast.error(`Failed to import transactions. ${e.message}`);
      },
    }),
  );
  const { data: presets } = useQuery(trpc.importPresets.list.queryOptions());
  const { data: categories } = useQuery(trpc.categories.list.queryOptions());
  const preset = useMemo(
    () => presets?.find((p) => p.id === account.csvImportPresetId),
    [presets, account.csvImportPresetId],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileUploaded = useCallback(
    async (csv: string) => {
      if (!preset) return;

      try {
        const lines = csv.split('\n');
        const trimmed = lines
          .slice(preset.rowsToSkipStart, lines.length - preset.rowsToSkipEnd)
          .join('\n');
        const { data: records } = Papa.parse<string[]>(trimmed, {
          delimiter: preset.delimiter || ',',
          skipEmptyLines: true,
        });

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
            date: formatDateISO(record[dateIndex], preset.dateFormat),
            description,
            amount: actualAmount - fee,
            categoryId:
              categories?.find((category) =>
                category.importPatterns.some((pattern) =>
                  description.toLowerCase().includes(pattern.toLowerCase()),
                ),
              )?.id ?? null,
          };
        });

        await createTransactions({
          accountId: account.id,
          transactions,
        });
      } catch {
        toast.error('Failed to import transactions.');
      }
    },
    [preset, categories, createTransactions, account.id],
  );

  const handleFileSelected: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => handleFileUploaded(reader.result as string);
      reader.readAsText(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
}

function parseNumericField(
  record: string[],
  preset: CSVImportPreset,
  fieldName: CSVImportField,
) {
  const fieldIndex = preset.fields.indexOf(fieldName);
  let str = fieldIndex > -1 ? record[fieldIndex] : '0';
  if (preset.decimal === '.') {
    str = str.replace(',', '');
  } else if (preset.decimal === ',') {
    str = str.replace('.', '').replace(',', '.');
  }
  return Number.parseFloat(str);
}

function formatDateISO(dateStr: string, dateFormat: string) {
  const now = new Date();
  const utcNow = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const parsed = parseDate(dateStr, dateFormat, utcNow);
  return formatDate(parsed, 'yyyy-MM-dd');
}
