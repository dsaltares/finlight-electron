'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { RowSelectionState } from '@tanstack/react-table';
import {
  FilterX,
  Pencil,
  Plus,
  ReceiptText,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import BulkEditTransactionsDialog from '@/components/BulkEditTransactionsDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import CreateUpdateTransactionDialog from '@/components/CreateUpdateTransactionDialog';
import EmptyState from '@/components/EmptyState';
import TransactionFilterChips from '@/components/TransactionFilterChips';
import TransactionFilterDialog from '@/components/TransactionFilterDialog';
import TransactionTable from '@/components/TransactionTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useDialog from '@/hooks/use-dialog';
import useTransactionFilters from '@/hooks/useTransactionFilters';
import { useTRPC } from '@/lib/trpc';

export default function TransactionsPage() {
  const trpc = useTRPC();
  const [search, setSearch] = useQueryState('q', { defaultValue: '' });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { queryInput, hasFilters, clearFilters } = useTransactionFilters();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery(
    trpc.transactions.list.queryOptions(queryInput),
  );
  const { data: accountsData, isLoading: isLoadingAccounts } = useQuery(
    trpc.accounts.list.queryOptions({}),
  );
  const { data: categories, isLoading: isLoadingCategories } = useQuery(
    trpc.categories.list.queryOptions(),
  );
  const {
    open: isCreateDialogOpen,
    onOpen: onCreateDialogOpen,
    onClose: onCreateDialogClose,
  } = useDialog();

  const { mutateAsync: createTransaction, isPending: isCreating } = useMutation(
    trpc.transactions.create.mutationOptions({
      onSuccess: () => {
        toast.success('Transaction created.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to create transaction. ${error.message}`
            : 'Failed to create transaction.',
        );
      },
    }),
  );

  const { mutate: deleteManyTransactions, isPending: isBulkDeleting } =
    useMutation(
      trpc.transactions.deleteMany.mutationOptions({
        onSuccess: (count) => {
          toast.success(
            `${count} transaction${count === 1 ? '' : 's'} deleted.`,
          );
          setRowSelection({});
        },
        onError: (error) => {
          toast.error(
            error.message
              ? `Failed to delete transactions. ${error.message}`
              : 'Failed to delete transactions.',
          );
        },
      }),
    );

  const { mutateAsync: updateManyTransactions, isPending: isBulkEditing } =
    useMutation(
      trpc.transactions.updateMany.mutationOptions({
        onSuccess: (count) => {
          toast.success(
            `${count} transaction${count === 1 ? '' : 's'} updated.`,
          );
        },
        onError: (error) => {
          toast.error(
            error.message
              ? `Failed to update transactions. ${error.message}`
              : 'Failed to update transactions.',
          );
        },
      }),
    );

  const selectedIds = useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, v]) => v)
        .map(([k]) => Number(k)),
    [rowSelection],
  );
  const selectedCount = selectedIds.length;

  const handleBulkDelete = async () => {
    deleteManyTransactions({ ids: selectedIds });
  };

  const {
    open: isBulkDeleteDialogOpen,
    onOpen: onBulkDeleteDialogOpen,
    onClose: onBulkDeleteDialogClose,
  } = useDialog();

  const {
    open: isBulkEditDialogOpen,
    onOpen: onBulkEditDialogOpen,
    onClose: onBulkEditDialogClose,
  } = useDialog();

  const {
    open: isFilterDialogOpen,
    onOpen: onFilterDialogOpen,
    onClose: onFilterDialogClose,
  } = useDialog();

  const handleBulkEdit = async (fields: Record<string, unknown>) => {
    await updateManyTransactions({ ids: selectedIds, ...fields });
    setRowSelection({});
  };

  const isLoading =
    isLoadingTransactions || isLoadingAccounts || isLoadingCategories;
  const accounts = accountsData?.accounts ?? [];

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (!search.trim()) return transactions;
    const query = search.trim().toLowerCase();
    return transactions.filter((transaction) =>
      transaction.description.toLowerCase().includes(query),
    );
  }, [transactions, search]);

  let content = null;
  if (isLoading) {
    content = (
      <div className="flex w-full justify-center items-center h-full">
        <Spinner />
      </div>
    );
  } else if (!transactions || transactions.length === 0) {
    content = (
      <EmptyState Icon={ReceiptText}>
        {hasFilters
          ? 'No transactions match your filters.'
          : 'No transactions found.'}
      </EmptyState>
    );
  } else if (filteredTransactions.length === 0) {
    content = (
      <EmptyState Icon={ReceiptText}>
        No transactions match your search.
      </EmptyState>
    );
  } else {
    content = (
      <TransactionTable
        transactions={filteredTransactions}
        accounts={accounts}
        categories={categories ?? []}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    );
  }

  return (
    <div
      className="flex min-h-0 flex-col gap-4 overflow-hidden pt-2"
      style={{
        height: 'calc(100dvh - var(--header-height) - 2rem)',
      }}
    >
      <div className="flex shrink-0 flex-row items-center gap-3">
        {transactions && transactions.length > 0 ? (
          <span className="shrink-0 text-sm text-muted-foreground">
            {filteredTransactions.length}{' '}
            {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
          </span>
        ) : null}
        <Input
          placeholder="Search..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full"
        />
        {selectedCount > 0 ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative shrink-0"
                  onClick={onBulkEditDialogOpen}
                >
                  <Pencil className="size-4" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                    {selectedCount}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit selected</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="relative shrink-0"
                  onClick={onBulkDeleteDialogOpen}
                >
                  <Trash2 className="size-4" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                    {selectedCount}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete selected</TooltipContent>
            </Tooltip>
          </>
        ) : null}
        {hasFilters ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={clearFilters}
                className="shrink-0"
              >
                <FilterX className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear filters</TooltipContent>
          </Tooltip>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onFilterDialogOpen}
              className="shrink-0"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Filters</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={onCreateDialogOpen}
              className="shrink-0"
            >
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New transaction</TooltipContent>
        </Tooltip>
      </div>

      <TransactionFilterChips />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {content}
      </div>

      <CreateUpdateTransactionDialog
        open={isCreateDialogOpen}
        loading={isCreating}
        accounts={accounts}
        onClose={onCreateDialogClose}
        onCreate={createTransaction}
      />

      <ConfirmationDialogBulkDelete
        open={isBulkDeleteDialogOpen}
        loading={isBulkDeleting}
        count={selectedCount}
        onClose={onBulkDeleteDialogClose}
        onConfirm={handleBulkDelete}
      />

      <BulkEditTransactionsDialog
        open={isBulkEditDialogOpen}
        loading={isBulkEditing}
        onClose={onBulkEditDialogClose}
        onUpdate={handleBulkEdit}
      />

      <TransactionFilterDialog
        open={isFilterDialogOpen}
        onClose={onFilterDialogClose}
      />
    </div>
  );
}

function ConfirmationDialogBulkDelete({
  open,
  loading,
  count,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ConfirmationDialog
      id="bulk-delete-transactions"
      title="Delete transactions"
      open={open}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <p>
        Are you sure you want to delete {count}{' '}
        {count === 1 ? 'transaction' : 'transactions'}? This action cannot be
        undone.
      </p>
    </ConfirmationDialog>
  );
}
