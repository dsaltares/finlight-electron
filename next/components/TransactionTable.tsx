'use client';

import { useMutation } from '@tanstack/react-query';
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import CategoryPill from '@/components/CategoryPill';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import CreateUpdateTransactionDialog from '@/components/CreateUpdateTransactionDialog';
import TransactionTypePill from '@/components/TransactionTypePill';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useDialogForId from '@/hooks/useDialogForId';
import useTransactionFilters, {
  serializeTransactionFilters,
} from '@/hooks/useTransactionFilters';
import { formatAmount, formatDate } from '@/lib/format';
import { type RouterOutput, useTRPC } from '@/lib/trpc';
import type { TransactionType } from '@/server/trpc/procedures/schema';

type Transaction = RouterOutput['transactions']['list'][number];
type Account = RouterOutput['accounts']['list']['accounts'][number];
type Category = RouterOutput['categories']['list'][number];

type TransactionRow = Transaction & {
  accountName: string;
  currency: string;
  categoryName: string | null;
  categoryColor: string | null;
};

type Props = {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  rowSelection: RowSelectionState;
  onRowSelectionChange: (value: RowSelectionState) => void;
};

const ROW_HEIGHT = 36;
const DEFAULT_SORT: SortingState = [{ id: 'date', desc: true }];

export default function TransactionTable({
  transactions,
  accounts,
  categories,
  rowSelection,
  onRowSelectionChange,
}: Props) {
  const trpc = useTRPC();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sorting, onSortingChange] = useState<SortingState>(DEFAULT_SORT);
  const { setAccount, setCategory, setType } = useTransactionFilters();

  const {
    openFor: deleteOpenFor,
    open: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDialogForId();

  const {
    openFor: updateTransactionId,
    open: isUpdateDialogOpen,
    onOpen: onUpdateDialogOpen,
    onClose: onUpdateDialogClose,
  } = useDialogForId();

  const { mutateAsync: deleteTransaction, isPending: isDeleting } = useMutation(
    trpc.transactions.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Transaction deleted.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to delete transaction. ${error.message}`
            : 'Failed to delete transaction.',
        );
      },
    }),
  );

  const { mutateAsync: updateTransaction, isPending: isUpdating } = useMutation(
    trpc.transactions.update.mutationOptions({
      onSuccess: () => {
        toast.success('Transaction updated.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to update transaction. ${error.message}`
            : 'Failed to update transaction.',
        );
      },
    }),
  );

  const handleDelete = useCallback(async () => {
    if (!deleteOpenFor) return;
    await deleteTransaction({ id: deleteOpenFor });
  }, [deleteOpenFor, deleteTransaction]);

  const handleCopyDescription = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  }, []);

  const transactionToUpdate = useMemo(
    () =>
      transactions.find(
        (transaction) => transaction.id === updateTransactionId,
      ),
    [transactions, updateTransactionId],
  );

  const accountsById = useMemo(() => {
    const map = new Map<number, Account>();
    for (const account of accounts) {
      map.set(account.id, account);
    }
    return map;
  }, [accounts]);

  const categoriesById = useMemo(() => {
    const map = new Map<number, Category>();
    for (const category of categories) {
      map.set(category.id, category);
    }
    return map;
  }, [categories]);

  const data: TransactionRow[] = useMemo(
    () =>
      transactions.map((transaction) => {
        const account = accountsById.get(transaction.accountId);
        const category = transaction.categoryId
          ? categoriesById.get(transaction.categoryId)
          : null;
        return {
          ...transaction,
          accountName: account?.name ?? 'Unknown account',
          currency: account?.currency ?? 'EUR',
          categoryName: category?.name ?? null,
          categoryColor: category?.color ?? null,
        };
      }),
    [transactions, accountsById, categoriesById],
  );

  const columns: ColumnDef<TransactionRow>[] = useMemo(
    () => [
      {
        id: 'select',
        size: 40,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllRowsSelected() ||
              (table.getIsSomeRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value: boolean | 'indeterminate') =>
              table.toggleAllRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean | 'indeterminate') =>
              row.toggleSelected(!!value)
            }
          />
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ getValue }) => formatDate(getValue<string>()),
        sortingFn: 'alphanumeric',
        size: 150,
      },
      {
        accessorKey: 'accountName',
        header: 'Account',
        size: 130,
        cell: ({ row }) => {
          const href = serializeTransactionFilters('/dashboard/transactions', {
            accounts: [row.original.accountId],
          });
          return (
            <Link
              href={href}
              className="hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setAccount(row.original.accountId);
              }}
            >
              {row.original.accountName}
            </Link>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span
            className={
              row.original.amount >= 0 ? 'text-green-600' : 'text-red-600'
            }
          >
            {formatAmount(row.original.amount, row.original.currency)}
          </span>
        ),
        sortingFn: 'basic',
        size: 120,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 110,
        cell: ({ getValue }) => {
          const type = getValue<TransactionType>();
          return (
            <TransactionTypePill type={type} onClick={() => setType(type)} />
          );
        },
      },
      {
        accessorKey: 'categoryName',
        header: 'Category',
        cell: ({ row }) =>
          row.original.categoryId &&
          row.original.categoryName &&
          row.original.categoryColor ? (
            <CategoryPill
              categoryId={row.original.categoryId!}
              name={row.original.categoryName}
              color={row.original.categoryColor}
              onClick={() => setCategory(row.original.categoryId!)}
            />
          ) : null,
        size: 130,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 200,
        cell: ({ getValue }) => {
          const value = getValue<string>();
          if (!value) return null;
          return (
            <DescriptionCell value={value} onCopy={handleCopyDescription} />
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onUpdateDialogOpen(row.original.id)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onDeleteDialogOpen(row.original.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [
      onUpdateDialogOpen,
      onDeleteDialogOpen,
      setAccount,
      setCategory,
      setType,
      handleCopyDescription,
    ],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      onRowSelectionChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => `${row.id}`,
    enableRowSelection: true,
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  return (
    <>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={
                      header.column.getCanSort()
                        ? 'cursor-pointer select-none'
                        : ''
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="size-3" />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="size-3" />
                      ) : null}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {virtualizer.getVirtualItems().length > 0 ? (
              <>
                {virtualizer.getVirtualItems()[0]?.start > 0 && (
                  <tr key="spacer-top">
                    <td
                      colSpan={columns.length}
                      style={{
                        height: virtualizer.getVirtualItems()[0]?.start ?? 0,
                        padding: 0,
                      }}
                    />
                  </tr>
                )}
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <TableRow
                      key={virtualRow.index}
                      data-index={virtualRow.index}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                {virtualizer.getTotalSize() -
                  (virtualizer.getVirtualItems().at(-1)?.end ?? 0) >
                  0 && (
                  <tr key="spacer-bottom">
                    <td
                      colSpan={columns.length}
                      style={{
                        height:
                          virtualizer.getTotalSize() -
                          (virtualizer.getVirtualItems().at(-1)?.end ?? 0),
                        padding: 0,
                      }}
                    />
                  </tr>
                )}
              </>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        id="delete-transaction"
        title="Delete transaction"
        open={isDeleteDialogOpen}
        loading={isDeleting}
        onClose={onDeleteDialogClose}
        onConfirm={handleDelete}
      >
        <p>
          Are you sure you want to delete this transaction? This action cannot
          be undone.
        </p>
      </ConfirmationDialog>

      {transactionToUpdate ? (
        <CreateUpdateTransactionDialog
          transaction={transactionToUpdate}
          open={isUpdateDialogOpen}
          loading={isUpdating}
          accounts={accounts}
          onClose={onUpdateDialogClose}
          onUpdate={updateTransaction}
        />
      ) : null}
    </>
  );
}

function DescriptionCell({
  value,
  onCopy,
}: {
  value: string;
  onCopy: (text: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const handleMouseEnter = useCallback(() => {
    const el = ref.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, []);

  const trigger = (
    <button
      ref={ref}
      type="button"
      className="block max-w-[200px] cursor-pointer truncate"
      onMouseEnter={handleMouseEnter}
      onClick={() => onCopy(value)}
    >
      {value}
    </button>
  );

  if (!isTruncated) return trigger;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{value}</TooltipContent>
    </Tooltip>
  );
}
