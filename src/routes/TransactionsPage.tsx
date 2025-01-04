import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import type { RowSelectionState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Helmet } from 'react-helmet';
import { enqueueSnackbar } from 'notistack';
import TransactionTable from '@components/TransactionTable';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import Fab from '@components/Fab';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import EmptyState from '@components/EmptyState';
import AppName from '@lib/appName';
import useIsMobile from '@lib/useIsMobile';
import client from '@lib/client';
import useDialog from '@components/useDialog';
import DownloadCSVButton from '@components/DownloadCSVButton';
import getDateFilter from '@lib/getDateFilter';
import TransactionFilterChips from '@components/TransactionFilterChips';
import CreateUpdateTransactionDialog from '@components/CreateUpdateTransactionDialog';
import type { TransactionType } from '@server/transactions/types';
import TransactionFilterDialog from '@components/TransactionFilterDialog';

export default function TransactionsPage() {
  const isMobile = useIsMobile();
  const {
    open: isCreateDialogOpen,
    onOpen: onCreateDialogOpen,
    onClose: onCreateDialogClose,
  } = useDialog();
  const {
    open: isFilterDialogOpen,
    onOpen: onFilterDialogOpen,
    onClose: onFilterDialogClose,
  } = useDialog();
  const {
    open: multiDeleteOpen,
    onOpen: onMultiDeleteOpen,
    onClose: onMultiDeleteClose,
  } = useDialog();
  const {
    open: multiUpdateOpen,
    onOpen: onMultiUpdateOpen,
    onClose: onMultiUpdateClose,
  } = useDialog();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const hasRowsSelected = Object.keys(rowSelection).length > 0;
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const { data: transactions, isLoading: isLoadingTransactions } =
    client.getTransactions.useQuery({
      date: getDateFilter(filtersByField),
      minAmount: filtersByField.minAmount
        ? parseFloat(filtersByField.minAmount)
        : undefined,
      maxAmount: filtersByField.maxAmount
        ? parseFloat(filtersByField.maxAmount)
        : undefined,
      accounts: filtersByField.accounts?.split(',').map(Number),
      type: filtersByField.type as TransactionType | undefined,
      categories: filtersByField.categories?.split(',').map(Number),
      description: filtersByField.description,
    });
  const { data, isLoading: isLoadingAccounts } = client.getAccounts.useQuery();
  const { data: categories, isLoading: isLoadingCategories } =
    client.getCategories.useQuery();
  const { mutateAsync: createTransaction, isPending: isCreating } =
    client.createTransaction.useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          message: 'Transaction created.',
          variant: 'success',
        });
      },
      onError: (e) => {
        enqueueSnackbar({
          message: `Failed to create transaction. ${e.message}`,
          variant: 'error',
        });
      },
    });

  const isLoading =
    isLoadingTransactions || isLoadingAccounts || isLoadingCategories;
  let content = null;
  if (isLoading) {
    content = <FullScreenSpinner />;
  } else if (!transactions || transactions.length === 0) {
    content = (
      <EmptyState Icon={ReceiptLongIcon}>No transactions found.</EmptyState>
    );
  } else {
    content = (
      <TransactionTable
        transactions={transactions}
        accounts={data?.accounts || []}
        categories={categories || []}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        multiDeleteOpen={multiDeleteOpen}
        onMultiDeleteClose={onMultiDeleteClose}
        multiUpdateOpen={multiUpdateOpen}
        onMultiUpdateClose={onMultiUpdateClose}
      />
    );
  }

  const enrichedTransactions = useMemo(() => {
    const categoriesById =
      categories?.reduce<Record<string, string>>(
        (acc, category) => ({ ...acc, [category.id]: category.name }),
        {},
      ) || {};
    const accountsById =
      data?.accounts?.reduce<Record<string, string>>(
        (acc, account) => ({ ...acc, [account.id]: account.name }),
        {},
      ) || {};
    return transactions?.map((transaction) => ({
      ...transaction,
      category: transaction.categoryId
        ? categoriesById[transaction.categoryId]
        : null,
      account: accountsById[transaction.accountId],
    }));
  }, [transactions, categories, data?.accounts]);

  return (
    <>
      <Helmet>
        <title>{`Transactions - ${AppName}`}</title>
      </Helmet>
      <Stack gap={2} height="100%">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          {!isMobile && transactions && (
            <Stack>
              <Typography
                variant="subtitle2"
                noWrap
              >{`${transactions?.length} ${
                transactions?.length === 1 ? 'transaction' : 'transactions'
              }`}</Typography>
            </Stack>
          )}
          <TextField
            fullWidth
            placeholder="Search..."
            size="small"
            value={filtersByField.transactionsGlobally || ''}
            onChange={(e) =>
              setFilters({ transactionsGlobally: e.target.value })
            }
          />
          <Stack direction="row" gap={1}>
            <IconButton
              color="error"
              onClick={onMultiDeleteOpen}
              disabled={!hasRowsSelected}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={onMultiUpdateOpen}
              disabled={!hasRowsSelected}
            >
              <EditIcon />
            </IconButton>
            <Badge
              badgeContent={Object.keys(filtersByField).length}
              color="secondary"
            >
              <IconButton color="primary" onClick={onFilterDialogOpen}>
                <FilterAltIcon />
              </IconButton>
            </Badge>
            <DownloadCSVButton
              fileName="transactions.csv"
              records={enrichedTransactions || []}
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'account', label: 'Account' },
                { key: 'date', label: 'Date' },
                { key: 'amount', label: 'Amount' },
                { key: 'type', label: 'Type' },
                { key: 'category', label: 'Category' },
                { key: 'description', label: 'Description' },
              ]}
              headers
            />
          </Stack>
        </Stack>
        <TransactionFilterChips />
        {content}
        <CreateUpdateTransactionDialog
          open={isCreateDialogOpen}
          loading={isCreating}
          accounts={data?.accounts || []}
          categories={categories || []}
          onClose={onCreateDialogClose}
          onCreate={createTransaction}
        />
        {isFilterDialogOpen && (
          <TransactionFilterDialog
            open={isFilterDialogOpen}
            onClose={onFilterDialogClose}
            accounts={data?.accounts || []}
            categories={categories || []}
          />
        )}
        <Fab aria-label="New transaction" onClick={onCreateDialogOpen}>
          <AddIcon />
        </Fab>
      </Stack>
    </>
  );
}
