import type { Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { forwardRef, useCallback } from 'react';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import { TableVirtuoso, type TableComponents } from 'react-virtuoso';
import useSortFromUrl from '@lib/useSortFromUrl';
import type { ExchangeRate } from '@server/exchangeRates/types';
import useExchangeRatesTable, { DefaultSort } from './useExchangeRatesTable';

const VirtuosoTableComponents: TableComponents<Row<ExchangeRate>> = {
  Scroller: forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table
      {...props}
      size="small"
      sx={{ borderCollapse: 'separate', tableLayout: 'fixed', minWidth: 650 }}
    />
  ),
  TableHead: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableHead {...props} ref={ref} sx={{ backgroundColor: 'white' }} />
  )),
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} hover />,
  TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

type Props = {
  rates: ExchangeRate[];
  onUpdateRate: (idx: number, rate: ExchangeRate) => void;
};

export default function ExchangeRatesTableTable({
  rates,
  onUpdateRate,
}: Props) {
  const table = useExchangeRatesTable(rates, onUpdateRate);
  const { toggleSort } = useSortFromUrl(DefaultSort);

  const fixedHeaderContent = useCallback(
    () =>
      table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableCell
              key={header.id}
              sortDirection={header.column.getIsSorted()}
              align={
                header.getContext().column.columnDef.meta?.numeric
                  ? 'right'
                  : 'left'
              }
            >
              {header.column.columnDef.enableSorting !== false ? (
                <TableSortLabel
                  active={!!header.column.getIsSorted()}
                  direction={header.column.getIsSorted() || undefined}
                  onClick={() => toggleSort(header.column.id)}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableSortLabel>
              ) : (
                flexRender(header.column.columnDef.header, header.getContext())
              )}
            </TableCell>
          ))}
        </TableRow>
      )),
    [table, toggleSort],
  );

  return (
    <Paper sx={{ height: '100%' }}>
      <TableVirtuoso
        data={table.getRowModel().rows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  );
}

function rowContent(_index: number, row: Row<ExchangeRate>) {
  return (
    <>
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          align={cell.column.columnDef.meta?.numeric ? 'right' : 'left'}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </>
  );
}
