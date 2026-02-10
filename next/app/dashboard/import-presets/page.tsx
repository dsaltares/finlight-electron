'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { FileUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CreateUpdateCSVImportPresetDialog from '@/components/CreateUpdateCSVImportPresetDialog';
import CSVImportPresetList from '@/components/CSVImportPresetList';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import useDialog from '@/hooks/use-dialog';
import { useTRPC } from '@/lib/trpc';

export default function ImportPresetsPage() {
  const trpc = useTRPC();
  const { data: presets, isLoading } = useQuery(
    trpc.importPresets.list.queryOptions(),
  );
  const {
    open: isCreateDialogOpen,
    onOpen: onCreateDialogOpen,
    onClose: onCreateDialogClose,
  } = useDialog();

  const { mutateAsync: createPreset, isPending: isCreating } = useMutation(
    trpc.importPresets.create.mutationOptions({
      onSuccess: () => {
        toast.success('Import preset created.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to create import preset. ${error.message}`
            : 'Failed to create import preset.',
        );
      },
    }),
  );

  let content = null;
  if (isLoading) {
    content = (
      <div className="flex w-full justify-center items-center h-full">
        <Spinner />
      </div>
    );
  } else if (!presets || presets.length === 0) {
    content = (
      <EmptyState Icon={FileUp}>
        You don't have any import presets yet.
      </EmptyState>
    );
  } else {
    content = <CSVImportPresetList presets={presets} />;
  }

  return (
    <div
      className="flex min-h-0 flex-col gap-4 overflow-hidden"
      style={{
        height: 'calc(100dvh - var(--header-height) - 2rem)',
      }}
    >
      <div className="flex shrink-0 items-center justify-end">
        <Button onClick={onCreateDialogOpen}>
          <Plus className="size-4" />
          New preset
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {content}
      </div>

      <CreateUpdateCSVImportPresetDialog
        open={isCreateDialogOpen}
        loading={isCreating}
        onClose={onCreateDialogClose}
        onCreate={createPreset}
      />
    </div>
  );
}
