'use client';

import {
  type ColumnDef,
  type ColumnSort,
  createColumnHelper,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRateFilter } from '@/hooks/useFilters';
import useSortFromUrl from '@/hooks/useSortFromUrl';
import flags from '@/lib/flags';
import { formatCurrencyValue, formatDate } from '@/lib/format';
import type { ExchangeRate } from '@/server/trpc/procedures/exchangeRates';

export const DefaultSort: ColumnSort = { id: 'ticker', desc: true };
const columnHelper = createColumnHelper<ExchangeRate>();

export default function useExchangeRatesTable(rates: ExchangeRate[]): {
  columns: ColumnDef<ExchangeRate, unknown>[];
  data: ExchangeRate[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  globalFilter: string | undefined;
} {
  const { debouncedRateFilter } = useRateFilter();
  const { sorting, toggleSort, onSortingChange } = useSortFromUrl(DefaultSort);

  const columns = useMemo(
    () => [
      columnHelper.display({
        enableSorting: false,
        id: 'avatar',
        header: '',
        cell: (info) => (
          <Avatar size="sm">
            <AvatarImage
              src={flags[info.row.original.code.toLowerCase()]}
              alt=""
            />
            <AvatarFallback className="text-xs">
              {info.row.original.code}
            </AvatarFallback>
          </Avatar>
        ),
      }),
      columnHelper.accessor('ticker', {
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 hover:underline"
            onClick={() => toggleSort(column.id)}
          >
            Ticker
            {column.getIsSorted() === 'asc' ? ' ↑' : null}
            {column.getIsSorted() === 'desc' ? ' ↓' : null}
          </button>
        ),
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor('currency', {
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 hover:underline"
            onClick={() => toggleSort(column.id)}
          >
            Currency
            {column.getIsSorted() === 'asc' ? ' ↑' : null}
            {column.getIsSorted() === 'desc' ? ' ↓' : null}
          </button>
        ),
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor('close', {
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 hover:underline"
            onClick={() => toggleSort(column.id)}
          >
            Rate
            {column.getIsSorted() === 'asc' ? ' ↑' : null}
            {column.getIsSorted() === 'desc' ? ' ↓' : null}
          </button>
        ),
        cell: (info) => (
          <span className="text-right text-sm tabular-nums">
            {formatCurrencyValue(info.getValue() ?? 1.0)}{' '}
            {info.row.original.code}
          </span>
        ),
        meta: { align: 'right' as const },
      }),
      columnHelper.accessor('date', {
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 hover:underline"
            onClick={() => toggleSort(column.id)}
          >
            Date
            {column.getIsSorted() === 'asc' ? ' ↑' : null}
            {column.getIsSorted() === 'desc' ? ' ↓' : null}
          </button>
        ),
        cell: (info) => (
          <span className="text-sm">{formatDate(info.getValue())}</span>
        ),
      }),
      // Hidden column so global filter can search by code
      columnHelper.accessor('code', {
        header: '',
        cell: () => null,
        meta: { isHidden: true },
        enableSorting: false,
      }),
    ],
    [toggleSort],
  );

  return {
    columns: columns as ColumnDef<ExchangeRate, unknown>[],
    data: rates,
    sorting,
    onSortingChange,
    globalFilter: debouncedRateFilter ?? undefined,
  };
}
