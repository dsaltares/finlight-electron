'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useMemo } from 'react';
import { type ColumnMeta, DataTable } from '@/components/DataTable';
import useSortFromUrl from '@/hooks/useSortFromUrl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatAmount, formatPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';

export type BudgetEntry = {
  type: 'Income' | 'Expense';
  categoryId: number;
  categoryName: string;
  target: number;
  actual: number;
};

type UpdateEntryArgs = {
  categoryId: number;
  field: 'type' | 'target';
  value: string | number;
};

type Props = {
  entries: BudgetEntry[];
  onUpdateEntry: (args: UpdateEntryArgs) => void;
  currency: string;
  search: string;
};

function getDiffColor(entry: BudgetEntry, diff: number) {
  if (entry.target === 0) return '';
  if (entry.type === 'Expense')
    return diff >= 0 ? 'text-green-600' : 'text-red-600';
  return diff >= 0 ? 'text-green-600' : 'text-red-600';
}

export default function BudgetTable({
  entries,
  onUpdateEntry,
  currency,
  search,
}: Props) {
  const { sorting, onSortingChange } = useSortFromUrl({
    id: 'type',
    desc: true,
  });

  const filtered = useMemo(() => {
    if (!search) return entries;
    const lower = search.toLowerCase();
    return entries.filter((e) => e.categoryName.toLowerCase().includes(lower));
  }, [entries, search]);

  const totals = useMemo(() => {
    const income = filtered.filter((e) => e.type === 'Income');
    const expense = filtered.filter((e) => e.type === 'Expense');
    return {
      targetIncome: income.reduce((s, e) => s + e.target, 0),
      actualIncome: income.reduce((s, e) => s + e.actual, 0),
      targetExpense: expense.reduce((s, e) => s + e.target, 0),
      actualExpense: expense.reduce((s, e) => s + e.actual, 0),
    };
  }, [filtered]);

  const netTarget = totals.targetIncome - totals.targetExpense;
  const netActual = totals.actualIncome - totals.actualExpense;
  const netDiff = netActual - netTarget;

  const columns = useMemo<ColumnDef<BudgetEntry>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        size: 140,
        minSize: 140,
        maxSize: 140,
        cell: ({ row }) => (
          <Select
            value={row.original.type}
            onValueChange={(v) =>
              onUpdateEntry({
                categoryId: row.original.categoryId,
                field: 'type',
                value: v,
              })
            }
          >
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Expense">
                <ArrowDownLeft className="size-3 text-red-500" />
                Expense
              </SelectItem>
              <SelectItem value="Income">
                <ArrowUpRight className="size-3 text-green-500" />
                Income
              </SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: 'Category',
      },
      {
        accessorKey: 'target',
        header: 'Target',
        meta: { align: 'right' } satisfies ColumnMeta,
        cell: ({ row }) => (
          <Input
            type="number"
            className="h-8 w-28 text-right text-xs ml-auto"
            value={Math.round(row.original.target / 100) || ''}
            onChange={(e) =>
              onUpdateEntry({
                categoryId: row.original.categoryId,
                field: 'target',
                value: Math.round(Number(e.target.value) * 100),
              })
            }
          />
        ),
      },
      {
        accessorKey: 'actual',
        header: 'Actual',
        meta: { align: 'right' } satisfies ColumnMeta,
        cell: ({ row }) => formatAmount(row.original.actual, currency),
      },
      {
        id: 'difference',
        header: 'Diff',
        meta: { align: 'right' } satisfies ColumnMeta,
        accessorFn: (row) => {
          if (row.type === 'Expense') return row.target - row.actual;
          return row.actual - row.target;
        },
        cell: ({ row }) => {
          const diff =
            row.original.type === 'Expense'
              ? row.original.target - row.original.actual
              : row.original.actual - row.original.target;
          return (
            <span className={getDiffColor(row.original, diff)}>
              {formatAmount(diff, currency)}
            </span>
          );
        },
      },
      {
        id: 'percentage',
        header: 'Diff (%)',
        meta: { align: 'right' } satisfies ColumnMeta,
        accessorFn: (row) => {
          if (row.target === 0) return 0;
          return row.actual / row.target;
        },
        cell: ({ row }) => {
          if (row.original.target === 0) return '-';
          const ratio = row.original.actual / row.original.target;
          const diff =
            row.original.type === 'Expense'
              ? row.original.target - row.original.actual
              : row.original.actual - row.original.target;
          return (
            <span className={getDiffColor(row.original, diff)}>
              {formatPercentage(ratio)}
            </span>
          );
        },
      },
    ],
    [currency, onUpdateEntry],
  );

  const pinnedContent = (
    <TableRow className="font-medium bg-muted/50">
      <TableCell colSpan={2}>Summary</TableCell>
      <TableCell className="text-right">
        {formatAmount(netTarget, currency)}
      </TableCell>
      <TableCell className="text-right">
        {formatAmount(netActual, currency)}
      </TableCell>
      <TableCell
        className={cn(
          'text-right',
          netDiff >= 0 ? 'text-green-600' : 'text-red-600',
        )}
      >
        {formatAmount(netDiff, currency)}
      </TableCell>
      <TableCell className="text-right">
        {netTarget !== 0 ? formatPercentage(netActual / netTarget) : '-'}
      </TableCell>
    </TableRow>
  );

  return (
    <DataTable
      columns={columns}
      data={filtered}
      sorting={sorting}
      onSortingChange={onSortingChange}
      pinnedContent={pinnedContent}
      wrapperClassName="h-full"
    />
  );
}
