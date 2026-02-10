'use client';

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { type CSVImportField, CSVImportFields } from '@/lib/importPresets';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type Props = {
  fields: CSVImportField[];
  onAppend: (field: CSVImportField) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
};

export default function ImportFields({
  fields,
  onAppend,
  onRemove,
  onMove,
}: Props) {
  const fieldRows = toFieldRows(fields);

  return (
    <div className="flex flex-col gap-2">
      <Select
        value=""
        onValueChange={(value) => {
          onAppend(value as CSVImportField);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Set field order" />
        </SelectTrigger>
        <SelectContent>
          {CSVImportFields.map((field) => (
            <SelectItem key={field} value={field}>
              {field}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card className="gap-0 py-0">
        {fields.length > 0 ? (
          <div className="divide-y">
            {fieldRows.map(({ key, field, index }) => (
              <div
                key={key}
                className="flex items-center justify-between px-4 py-2"
              >
                <p className="text-xs text-muted-foreground">{field}</p>
                <div className="flex items-center gap-1">
                  {index > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onMove(index, index - 1)}
                      aria-label={`Move ${field} up`}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                  ) : null}
                  {index < fields.length - 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onMove(index, index + 1)}
                      aria-label={`Move ${field} down`}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemove(index)}
                    aria-label={`Remove ${field}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-3 text-xs text-muted-foreground">
            No fields selected
          </p>
        )}
      </Card>
    </div>
  );
}

function toFieldRows(fields: CSVImportField[]) {
  const counts = new Map<CSVImportField, number>();

  return fields.map((field, index) => {
    const count = (counts.get(field) ?? 0) + 1;
    counts.set(field, count);
    return {
      key: `${field}-${count}`,
      field,
      index,
    };
  });
}
