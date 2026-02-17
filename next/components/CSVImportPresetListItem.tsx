'use client';

import { FileUp, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardTitle } from '@/components/ui/card';
import type { RouterOutput } from '@/lib/trpc';

type CSVImportPreset = RouterOutput['importPresets']['list'][number];

type Props = {
  preset: CSVImportPreset;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function CSVImportPresetListItem({
  preset,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <Card className="flex-row items-center border border-border py-0 ring-0">
      <CardContent className="flex flex-1 min-w-0 items-center gap-3 py-1">
        <Avatar>
          <AvatarFallback>
            <FileUp className="size-4" />
          </AvatarFallback>
        </Avatar>
        <CardTitle className="truncate">{preset.name}</CardTitle>
      </CardContent>

      <CardAction className="ml-auto flex shrink-0 items-center gap-1 self-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdate(preset.id)}
          aria-label={`Edit preset ${preset.name}`}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(preset.id)}
          aria-label={`Delete preset ${preset.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardAction>
    </Card>
  );
}
