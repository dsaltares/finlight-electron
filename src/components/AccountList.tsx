import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import type { CSVImportPreset } from '@server/csvImportPreset/types';
import useDialogForId from '@lib/useDialogForId';
import type { Account } from '@server/accounts/types';
import client from '@lib/client';
import AccountListItem from './AccountListItem';
import CreateUpdateAccountDialog from './CreateUpdateAccountDialog';
import ConfirmationDialog from './ConfirmationDialog';

type Props = {
  accounts: Account[];
  presets: CSVImportPreset[];
};

export default function AccountList({ accounts, presets }: Props) {
  const {
    openFor,
    open: deleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDialogForId('deleteAccount');
  const { mutateAsync: deleteAccount, isPending: isDeleting } =
    client.deleteAccount.useMutation();
  const handleDelete = () =>
    openFor ? deleteAccount({ id: openFor }) : undefined;

  const {
    openFor: accountId,
    open: isUpdateDialogOpen,
    onOpen: onUpdateDialogOpen,
    onClose: onUpdateDialogClose,
  } = useDialogForId('updateAccount');
  const account = useMemo(
    () => accounts.find((account) => account.id === accountId),
    [accounts, accountId],
  );
  const { mutateAsync: updateAccount, isPending: isUpdating } =
    client.updateAccount.useMutation();

  return (
    <Paper>
      <List>
        {accounts.map((account) => (
          <AccountListItem
            key={account.id}
            account={account}
            onUpdate={onUpdateDialogOpen}
            onDelete={onDeleteOpen}
          />
        ))}

        <ConfirmationDialog
          id="delete-account"
          title="Delete account"
          open={deleteOpen}
          loading={isDeleting}
          onClose={onDeleteClose}
          onConfirm={handleDelete}
        >
          <Typography variant="body1">
            Are you sure you want to delete this account? The action cannot be
            undone and all transactions for the account will also be deleted.
          </Typography>
        </ConfirmationDialog>

        {!!account && (
          <CreateUpdateAccountDialog
            account={account}
            presets={presets}
            open={isUpdateDialogOpen}
            loading={isUpdating}
            onClose={onUpdateDialogClose}
            onUpdate={updateAccount}
          />
        )}
      </List>
    </Paper>
  );
}
