'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface ColumnMeta {
  isHidden?: boolean;
  align?: 'left' | 'center' | 'right';
  isSticky?: boolean;
}

const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    default:
      return 'text-left';
  }
};

const getStickyClass = (isSticky?: boolean) =>
  isSticky ? 'sticky left-0 z-10 bg-background' : '';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sorting?: SortingState;
  initialSorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  globalFilter?: string;
  virtualized?: boolean;
  rowHeightEstimate?: number;
  overscan?: number;
  pinnedContent?: ReactNode;
  tableClassName?: string;
  wrapperClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting: externalSorting,
  initialSorting,
  onSortingChange: externalOnSortingChange,
  globalFilter,
  virtualized = false,
  rowHeightEstimate = 44,
  overscan = 8,
  pinnedContent,
  tableClassName,
  wrapperClassName,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(
    initialSorting ?? [],
  );
  const sorting = externalSorting ?? internalSorting;
  const onSortingChange = externalOnSortingChange ?? setInternalSorting;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange,
    state: {
      sorting,
      globalFilter: globalFilter ?? undefined,
    },
  });
  const rows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeightEstimate,
    overscan,
  });
  const virtualRows = virtualized ? rowVirtualizer.getVirtualItems() : [];
  const virtualPaddingTop =
    virtualized && virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0;
  const virtualPaddingBottom =
    virtualized && virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  const renderRow = (row: (typeof rows)[number]) => (
    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
        if (meta?.isHidden) return null;
        return (
          <TableCell
            key={cell.id}
            className={cn(
              getAlignmentClass(meta?.align),
              getStickyClass(meta?.isSticky),
            )}
            style={{
              width: cell.column.getSize(),
              minWidth: cell.column.columnDef.minSize,
              maxWidth: cell.column.columnDef.maxSize,
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );

  return (
    <div
      ref={tableContainerRef}
      className={cn(
        'flex-1 min-h-0 overflow-auto relative z-0',
        wrapperClassName,
      )}
    >
      <table className={cn('w-full caption-bottom text-sm', tableClassName)}>
        <TableHeader className="sticky top-0 z-20 bg-background shadow-sm after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as
                  | ColumnMeta
                  | undefined;
                if (meta?.isHidden) return null;
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      getAlignmentClass(meta?.align),
                      getStickyClass(meta?.isSticky),
                      canSort && 'cursor-pointer select-none',
                    )}
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-1',
                          meta?.align === 'right' && 'justify-end',
                          meta?.align === 'center' && 'justify-center',
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort &&
                          (sorted === 'asc' ? (
                            <ArrowUp className="size-3.5 shrink-0" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="size-3.5 shrink-0" />
                          ) : (
                            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
                          ))}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {pinnedContent}
          {rows.length ? (
            virtualized ? (
              <>
                {virtualPaddingTop > 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="p-0 border-0"
                      style={{ height: `${virtualPaddingTop}px` }}
                    />
                  </TableRow>
                ) : null}
                {virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return renderRow(row);
                })}
                {virtualPaddingBottom > 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="p-0 border-0"
                      style={{ height: `${virtualPaddingBottom}px` }}
                    />
                  </TableRow>
                ) : null}
              </>
            ) : (
              rows.map(renderRow)
            )
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </table>
    </div>
  );
}
