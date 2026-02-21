'use client';

import { FileUp } from 'lucide-react';
import Papa from 'papaparse';
import {
  type ChangeEventHandler,
  type MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { UseFormWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { CSVImportPresetFormValues } from './types';

type PreviewType = 'import' | 'raw';

type Props = {
  watch: UseFormWatch<CSVImportPresetFormValues>;
};

export default function ImportPreview({ watch }: Props) {
  const [delimiter, fields, rowsToSkipStart, rowsToSkipEnd] = watch([
    'delimiter',
    'fields',
    'rowsToSkipStart',
    'rowsToSkipEnd',
  ]);
  const [csv, setCSV] = useState('');
  const [previewType, setPreviewType] = useState<PreviewType>('import');
  const ref = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    ref.current?.click();
  };

  const handleFileUpload: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCSV(reader.result);
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  const { headers, rows } = useMemo(() => {
    if (csv === '') {
      return {
        headers: [] as string[],
        rows: [] as string[][],
      };
    }
    try {
      const start = Number.parseInt(rowsToSkipStart, 10) || 0;
      const end = Number.parseInt(rowsToSkipEnd, 10) || 0;
      const lines = csv.split('\n');
      const trimmed = lines.slice(start, lines.length - end).join('\n');
      const { data: records } = Papa.parse<string[]>(trimmed, {
        delimiter: delimiter || ',',
        skipEmptyLines: true,
      });
      const numCSVColumns = records[0]?.length ?? 0;
      const extraHeaders =
        fields.length < numCSVColumns
          ? Array.from(
              { length: numCSVColumns - fields.length },
              () => 'Unknown',
            )
          : [];

      return {
        headers: ['#', ...fields.map((field) => field.value), ...extraHeaders],
        rows: records,
      };
    } catch {
      return {
        headers: [] as string[],
        rows: [] as string[][],
      };
    }
  }, [csv, delimiter, fields, rowsToSkipStart, rowsToSkipEnd]);
  const headerEntries = useMemo(() => withStableKeys(headers), [headers]);
  const rowEntries = useMemo(() => withStableKeys(rows), [rows]);

  const rawCSVText = useMemo(
    () => csv.split('\n').filter(Boolean).join('\n'),
    [csv],
  );

  const handlePreviewTypeChange = (
    _event: MouseEvent<HTMLButtonElement>,
    nextPreviewType: PreviewType,
  ) => {
    setPreviewType(nextPreviewType);
  };

  return (
    <Card className="min-w-0 gap-2 overflow-x-hidden p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">Preview</p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={previewType === 'import' ? 'default' : 'outline'}
              onClick={(event) => handlePreviewTypeChange(event, 'import')}
            >
              Import
            </Button>
            <Button
              type="button"
              size="sm"
              variant={previewType === 'raw' ? 'default' : 'outline'}
              onClick={(event) => handlePreviewTypeChange(event, 'raw')}
            >
              Raw
            </Button>
          </div>
          <Button type="button" size="sm" onClick={handleUploadClick}>
            <FileUp className="size-4" />
            Choose file
            <input
              ref={ref}
              hidden
              type="file"
              accept="text/csv"
              onChange={handleFileUpload}
            />
          </Button>
        </div>
      </div>

      {previewType === 'import' ? (
        headers.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow>
                  {headerEntries.map((header) => (
                    <TableHead key={header.key}>{header.value}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowEntries.map((row, rowIndex) => (
                  <TableRow key={row.key}>
                    <TableCell>{rowIndex + 1}</TableCell>
                    {withStableKeys(row.value).map((cell) => (
                      <TableCell key={`${row.key}-${cell.key}`}>
                        {cell.value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Upload a CSV to preview.
          </p>
        )
      ) : (
        <Textarea readOnly value={rawCSVText} className="min-h-48 font-mono" />
      )}
    </Card>
  );
}

function withStableKeys<T>(values: T[]) {
  const counts = new Map<string, number>();
  return values.map((value) => {
    const base = String(value);
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    return {
      key: `${base}-${count}`,
      value,
    };
  });
}
