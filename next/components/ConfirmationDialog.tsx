'use client';

import type { PropsWithChildren } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Props = {
  id: string;
  title: string;
  open: boolean;
  loading: boolean;
  onConfirm: () => unknown | Promise<unknown>;
  onClose: () => void;
};

export default function ConfirmationDialog({
  id,
  title,
  open,
  loading,
  onConfirm,
  onClose,
  children,
}: PropsWithChildren<Props>) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <AlertDialogContent id={id}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="text-sm">{children}</div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {loading ? <Spinner className="mr-1" /> : null}
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
