'use client';

import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import useDialogForId from '@/hooks/useDialogForId';
import { type RouterOutput, useTRPC } from '@/lib/trpc';
import AccountListItem from './AccountListItem';
import ConfirmationDialog from './ConfirmationDialog';
import CreateUpdateAccountDialog from './CreateUpdateAccountDialog';

type Account = RouterOutput['accounts']['list']['accounts'][number];

type Props = {
  accounts: Account[];
};

export default function AccountList({ accounts }: Props) {
  const trpc = useTRPC();
  const {
    openFor,
    open: deleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDialogForId();

  const { mutateAsync: deleteAccount, isPending: isDeleting } = useMutation(
    trpc.accounts.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Account deleted.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to delete account. ${error.message}`
            : 'Failed to delete account.',
        );
      },
    }),
  );

  const handleDelete = async () => {
    if (!openFor) return;
    await deleteAccount({ id: openFor });
  };

  const {
    openFor: updateAccountId,
    open: isUpdateDialogOpen,
    onOpen: onUpdateDialogOpen,
    onClose: onUpdateDialogClose,
  } = useDialogForId();

  const accountToUpdate = useMemo(
    () => accounts.find((account) => account.id === updateAccountId),
    [accounts, updateAccountId],
  );

  const { mutateAsync: updateAccount, isPending: isUpdating } = useMutation(
    trpc.accounts.update.mutationOptions({
      onSuccess: () => {
        toast.success('Account updated.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to update account. ${error.message}`
            : 'Failed to update account.',
        );
      },
    }),
  );

  return (
    <>
      <ul className="m-0 list-none space-y-2 p-0">
        {accounts.map((account) => (
          <li key={account.id}>
            <AccountListItem
              account={account}
              onUpdate={onUpdateDialogOpen}
              onDelete={onDeleteOpen}
            />
          </li>
        ))}
      </ul>

      <ConfirmationDialog
        id="delete-account"
        title="Delete account"
        open={deleteOpen}
        loading={isDeleting}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
      >
        <p>
          Are you sure you want to delete this account? This action cannot be
          undone and all related transactions will also be deleted.
        </p>
      </ConfirmationDialog>

      {accountToUpdate ? (
        <CreateUpdateAccountDialog
          account={accountToUpdate}
          open={isUpdateDialogOpen}
          loading={isUpdating}
          onClose={onUpdateDialogClose}
          onUpdate={updateAccount}
        />
      ) : null}
    </>
  );
}
