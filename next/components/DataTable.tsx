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
import { useRef } from 'react';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ColumnMeta {
  isHidden?: boolean;
  align?: 'left' | 'center' | 'right';
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  globalFilter?: string;
  virtualized?: boolean;
  rowHeightEstimate?: number;
  overscan?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting,
  onSortingChange,
  globalFilter,
  virtualized = false,
  rowHeightEstimate = 44,
  overscan = 8,
}: DataTableProps<TData, TValue>) {
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

  return (
    <div
      ref={tableContainerRef}
      className="flex-1 min-h-0 border rounded-md overflow-auto relative"
    >
      <table className="w-full caption-bottom text-sm min-w-[800px]">
        <TableHeader className="sticky top-0 z-10 bg-background shadow-sm after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                if ((header.column.columnDef.meta as ColumnMeta)?.isHidden) {
                  return null;
                }
                const align = (header.column.columnDef.meta as ColumnMeta)
                  ?.align;
                return (
                  <TableHead
                    key={header.id}
                    className={getAlignmentClass(align)}
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
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
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => {
                        if (
                          (cell.column.columnDef.meta as ColumnMeta)?.isHidden
                        ) {
                          return null;
                        }
                        const align = (cell.column.columnDef.meta as ColumnMeta)
                          ?.align;
                        return (
                          <TableCell
                            key={cell.id}
                            className={getAlignmentClass(align)}
                            style={{
                              width: cell.column.getSize(),
                              minWidth: cell.column.columnDef.minSize,
                              maxWidth: cell.column.columnDef.maxSize,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
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
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => {
                    if ((cell.column.columnDef.meta as ColumnMeta)?.isHidden) {
                      return null;
                    }
                    const align = (cell.column.columnDef.meta as ColumnMeta)
                      ?.align;
                    return (
                      <TableCell
                        key={cell.id}
                        className={getAlignmentClass(align)}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize,
                          maxWidth: cell.column.columnDef.maxSize,
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
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
