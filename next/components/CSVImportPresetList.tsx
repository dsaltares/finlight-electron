'use client';

import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import useDialogForId from '@/hooks/useDialogForId';
import { type RouterOutput, useTRPC } from '@/lib/trpc';
import ConfirmationDialog from './ConfirmationDialog';
import CreateUpdateCSVImportPresetDialog from './CreateUpdateCSVImportPresetDialog';
import CSVImportPresetListItem from './CSVImportPresetListItem';

type CSVImportPreset = RouterOutput['importPresets']['list'][number];

type Props = {
  presets: CSVImportPreset[];
};

export default function CSVImportPresetList({ presets }: Props) {
  const trpc = useTRPC();
  const {
    openFor,
    open: deleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDialogForId();

  const { mutateAsync: deletePreset, isPending: isDeleting } = useMutation(
    trpc.importPresets.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Import preset deleted.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to delete import preset. ${error.message}`
            : 'Failed to delete import preset.',
        );
      },
    }),
  );

  const handleDelete = async () => {
    if (!openFor) return;
    await deletePreset(openFor);
  };

  const {
    openFor: updatePresetId,
    open: isUpdateDialogOpen,
    onOpen: onUpdateDialogOpen,
    onClose: onUpdateDialogClose,
  } = useDialogForId();
  const presetToUpdate = useMemo(
    () => presets.find((preset) => preset.id === updatePresetId),
    [presets, updatePresetId],
  );
  const { mutateAsync: updatePreset, isPending: isUpdating } = useMutation(
    trpc.importPresets.update.mutationOptions({
      onSuccess: () => {
        toast.success('Import preset updated.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to update import preset. ${error.message}`
            : 'Failed to update import preset.',
        );
      },
    }),
  );

  return (
    <>
      <ul className="m-0 list-none space-y-2 p-0">
        {presets.map((preset) => (
          <li key={preset.id}>
            <CSVImportPresetListItem
              preset={preset}
              onUpdate={onUpdateDialogOpen}
              onDelete={onDeleteOpen}
            />
          </li>
        ))}
      </ul>

      <ConfirmationDialog
        id="delete-preset"
        title="Delete import preset"
        open={deleteOpen}
        loading={isDeleting}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
      >
        <p>
          Are you sure you want to delete this import preset? This action cannot
          be undone.
        </p>
      </ConfirmationDialog>

      {presetToUpdate ? (
        <CreateUpdateCSVImportPresetDialog
          preset={presetToUpdate}
          open={isUpdateDialogOpen}
          loading={isUpdating}
          onClose={onUpdateDialogClose}
          onUpdate={updatePreset}
        />
      ) : null}
    </>
  );
}
