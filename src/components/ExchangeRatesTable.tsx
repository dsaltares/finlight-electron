import Avatar from '@mui/material/Avatar';
import type { HeaderGroup, Row } from '@tanstack/react-table';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import stringToColor from 'string-to-color';
import { memo, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import flags from '@lib/flags';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import useSortFromUrl from '@lib/useSortFromUrl';
import type { ExchangeRate } from '@server/exchangeRates/types';
import { formatDate } from '@lib/format';

export const DefaultSort = { id: 'ticker', desc: true };

const columnHelper = createColumnHelper<ExchangeRate>();
const ExchangeRateTableHead = memo(ExchangeRateTableHeadBase);
const ExchangeRateTableRow = memo(ExchangeRateTableRowBase);

type Props = {
  rates: ExchangeRate[];
  onUpdateRate: (idx: number, rate: ExchangeRate) => void;
};

export default function ExchangeRatesTableTable({
  rates,
  onUpdateRate,
}: Props) {
  const table = useExchangeRatesTable(rates, onUpdateRate);

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <ExchangeRateTableHead headerGroups={table.getHeaderGroups()} />
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <ExchangeRateTableRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function useExchangeRatesTable(
  rates: ExchangeRate[],
  onUpdateRate: Props['onUpdateRate'],
) {
  const { sorting } = useSortFromUrl(DefaultSort);
  const { filtersByField } = useFiltersFromUrl();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'avatar',
        header: '',
        cell: (info) => (
          <Avatar
            sx={{ backgroundColor: stringToColor(info.row.original.code) }}
            src={flags[info.row.original.code.toLowerCase()]}
          >
            {info.row.original.code}
          </Avatar>
        ),
      }),
      columnHelper.accessor('ticker', {
        header: 'Ticker',
        cell: (info) => (
          <Typography fontSize="inherit">{info.getValue()}</Typography>
        ),
      }),
      columnHelper.accessor('currency', {
        header: 'Currency',
        cell: (info) => (
          <Typography fontSize="inherit">{info.getValue()}</Typography>
        ),
      }),
      columnHelper.accessor('close', {
        header: 'Rate',
        cell: (info) => (
          <TextField
            defaultValue={info.getValue() || 1.0}
            type="number"
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {info.row.original.code}
                  </InputAdornment>
                ),
              },
            }}
            inputProps={{
              step: 0.0001,
              min: 0,
              style: { textAlign: 'right' },
            }}
            onChange={(e) =>
              onUpdateRate(info.row.index, {
                ...info.row.original,
                close: parseFloat(e.target.value),
              })
            }
          />
        ),
        meta: { numeric: true },
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => (
          <Typography fontSize="inherit">
            {formatDate(info.getValue())}
          </Typography>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: rates,
    columns,
    state: {
      sorting,
      globalFilter: filtersByField.rateSearch,
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return table;
}

type ExchangeRateTableHeadProps = {
  headerGroups: HeaderGroup<ExchangeRate>[];
};

function ExchangeRateTableHeadBase({
  headerGroups,
}: ExchangeRateTableHeadProps) {
  const { toggleSort } = useSortFromUrl(DefaultSort);
  return (
    <TableHead>
      {headerGroups.map((headerGroup) => (
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
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableHead>
  );
}

type ExchangeRateTableRowProps = {
  row: Row<ExchangeRate>;
};

function ExchangeRateTableRowBase({ row }: ExchangeRateTableRowProps) {
  return (
    <TableRow>
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          align={cell.column.columnDef.meta?.numeric ? 'right' : 'left'}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
