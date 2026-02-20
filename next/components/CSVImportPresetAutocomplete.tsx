'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import Combobox, { type Option } from '@/components/combobox';
import { Spinner } from '@/components/ui/spinner';
import { useTRPC } from '@/lib/trpc';

const NoPresetOption: Option = { value: '', label: 'No import preset' };

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function CSVImportPresetAutocomplete({
  value,
  onChange,
}: Props) {
  const trpc = useTRPC();
  const { data: presets, isLoading } = useQuery(
    trpc.importPresets.list.queryOptions(),
  );

  const presetOptions = useMemo<Option[]>(
    () => [
      NoPresetOption,
      ...(presets ?? []).map((preset) => ({
        value: `${preset.id}`,
        label: preset.name,
      })),
    ],
    [presets],
  );

  if (isLoading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-xs text-muted-foreground">
        <Spinner className="size-4" />
        Loading import presets...
      </div>
    );
  }

  return (
    <Combobox
      options={presetOptions}
      value={value}
      placeholder="Import preset"
      fullWidth
      onChange={onChange}
    />
  );
}
