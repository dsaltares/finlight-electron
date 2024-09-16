import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Stack from '@mui/material/Stack';
import { Helmet } from 'react-helmet';
import CreateUpdateAccountDialog from '@components/CreateUpdateAccountDialog';
import EmptyState from '@components/EmptyState';
import AccountList from '@components/AccountList';
import client from '@lib/client';
import AppName from '@lib/appName';
import useDialog from '@components/useDialog';
import Fab from '@components/Fab';
import BalanceCard from '@components/BalanceCard';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';

export default function AccountsPage() {
  const { data, isLoading: isLoadingAccounts } = client.getAccounts.useQuery();
  const { data: presets, isLoading: isLoadingPresets } =
    client.getCSVImportPresets.useQuery();
  const {
    open: isCreateDialogOpen,
    onOpen: onCreateDialogOpen,
    onClose: onCreateDialogClose,
  } = useDialog();
  const { mutateAsync: createAccount, isPending: isCreating } =
    client.createAccount.useMutation();

  const isLoading = isLoadingAccounts || isLoadingPresets;
  let content = null;
  if (isLoading) {
    content = <FullScreenSpinner />;
  } else if (!data || data.accounts.length === 0) {
    content = (
      <EmptyState
        Icon={AccountBalanceIcon}
      >{`You don't have any accounts yet.`}</EmptyState>
    );
  } else {
    content = (
      <Stack gap={2} paddingBottom={5}>
        <Stack direction="row" justifyContent="flex-start">
          <BalanceCard
            balance={data.total.value}
            currency={data.total.currency}
          />
        </Stack>
        <AccountList accounts={data.accounts} presets={presets || []} />
      </Stack>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Accounts - ${AppName}`}</title>
      </Helmet>
      {content}
      {isCreateDialogOpen && (
        <CreateUpdateAccountDialog
          presets={presets || []}
          open={isCreateDialogOpen}
          loading={isCreating}
          onClose={onCreateDialogClose}
          onCreate={createAccount}
        />
      )}
      <Fab aria-label="New account" onClick={onCreateDialogOpen}>
        <AddIcon />
      </Fab>
    </>
  );
}
