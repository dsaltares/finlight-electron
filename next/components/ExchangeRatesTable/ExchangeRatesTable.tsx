'use client';

import { DataTable } from '@/components/DataTable';
import type { ExchangeRate } from '@/server/trpc/procedures/exchangeRates';
import useExchangeRatesTable from './useExchangeRatesTable';

type Props = {
  rates: ExchangeRate[];
};

export default function ExchangeRatesTable({ rates }: Props) {
  const { columns, data, sorting, onSortingChange, globalFilter } =
    useExchangeRatesTable(rates);

  return (
    <DataTable
      columns={columns}
      data={data}
      sorting={sorting}
      onSortingChange={onSortingChange}
      globalFilter={globalFilter}
      virtualized
      rowHeightEstimate={44}
    />
  );
}
