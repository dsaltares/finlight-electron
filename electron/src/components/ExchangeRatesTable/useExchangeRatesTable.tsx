import { useMemo } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Avatar from '@mui/material/Avatar';
import stringToColor from 'string-to-color';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import useSortFromUrl from '@lib/useSortFromUrl';
import type { ExchangeRate } from '@server/exchangeRates/types';
import flags from '@lib/flags';
import { formatDate } from '@lib/format';

export const DefaultSort = { id: 'ticker', desc: true };
const columnHelper = createColumnHelper<ExchangeRate>();

export default function useExchangeRatesTable(
  rates: ExchangeRate[],
  onUpdateRate: (idx: number, rate: ExchangeRate) => void,
) {
  const { sorting } = useSortFromUrl(DefaultSort);
  const { filtersByField } = useFiltersFromUrl();

  const columns = useMemo(
    () => [
      columnHelper.display({
        enableSorting: false,
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
