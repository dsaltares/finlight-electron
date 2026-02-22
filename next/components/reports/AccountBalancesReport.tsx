'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { SearchX } from 'lucide-react';
import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { type ColumnMeta, DataTable } from '@/components/DataTable';
import EmptyState from '@/components/EmptyState';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Spinner } from '@/components/ui/spinner';
import useInsightsFilters from '@/hooks/useInsightsFilters';
import useSortFromUrl from '@/hooks/useSortFromUrl';
import { formatAmount } from '@/lib/format';
import { useTRPC } from '@/lib/trpc';
import { cn } from '@/lib/utils';

const ACCOUNT_COLORS = [
  '#2563EB',
  '#16A34A',
  '#EA580C',
  '#9333EA',
  '#0891B2',
  '#DC2626',
  '#CA8A04',
  '#0F766E',
  '#DB2777',
  '#4F46E5',
];

type AccountRow = {
  account: string;
  amounts: Record<string, number>;
};

export default function AccountBalancesReport({
  compact,
}: {
  compact?: boolean;
} = {}) {
  const trpc = useTRPC();
  const { queryInput, displayCurrency } = useInsightsFilters();
  const { data, isLoading } = useQuery(
    trpc.reports.getAccountBalancesReport.queryOptions(queryInput),
  );
  const currency = displayCurrency;
  const { sorting, onSortingChange } = useSortFromUrl();

  const accountNames = useMemo(
    () => (data && data.length > 0 ? Object.keys(data[0].positions) : []),
    [data],
  );

  const config: ChartConfig = useMemo(
    () => ({
      ...Object.fromEntries(
        accountNames.map((name, i) => [
          name,
          {
            label: name,
            color: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
          },
        ]),
      ),
      Total: {
        label: 'Total',
        color: 'var(--color-foreground)',
      },
    }),
    [accountNames],
  );

  const rows = useMemo<AccountRow[]>(
    () => [
      ...accountNames.map((name) => ({
        account: name,
        amounts: Object.fromEntries(
          (data ?? []).map((d) => [d.bucket, d.positions[name] ?? 0]),
        ),
      })),
      {
        account: 'Total',
        amounts: Object.fromEntries(
          (data ?? []).map((d) => [d.bucket, d.total]),
        ),
      },
    ],
    [accountNames, data],
  );

  const columns = useMemo<ColumnDef<AccountRow>[]>(
    () => [
      {
        accessorKey: 'account',
        header: 'Account',
        meta: { isSticky: true } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span
            className={cn(row.original.account === 'Total' && 'font-medium')}
          >
            {row.original.account}
          </span>
        ),
      },
      ...(data ?? []).map<ColumnDef<AccountRow>>((d) => ({
        id: d.bucket,
        accessorFn: (row: AccountRow) => row.amounts[d.bucket] ?? 0,
        header: d.bucket,
        meta: { align: 'right' } satisfies ColumnMeta,
        cell: ({ row, getValue }) => {
          const val = getValue<number>();
          return (
            <span
              className={cn(
                val >= 0 ? 'text-green-600' : 'text-red-600',
                row.original.account === 'Total' && 'font-medium',
              )}
            >
              {formatAmount(val, currency)}
            </span>
          );
        },
      })),
    ],
    [data, currency],
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!data || data.length === 0) {
    return <EmptyState Icon={SearchX}>No transactions found</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer
        config={config}
        className={compact ? 'h-48 w-full' : 'h-96 w-full'}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          {!compact && <XAxis dataKey="bucket" />}
          {!compact && <YAxis />}
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor:
                          item.payload?.fill || item.color || undefined,
                      }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {formatAmount(value as number, currency)}
                      </span>
                    </div>
                  </>
                )}
              />
            }
          />
          {!compact && <ChartLegend content={<ChartLegendContent />} />}
          {accountNames.map((name, i) => (
            <Line
              key={name}
              dataKey={`positions.${name}`}
              name={name}
              stroke={ACCOUNT_COLORS[i % ACCOUNT_COLORS.length]}
              dot={false}
            />
          ))}
          <Line
            dataKey="total"
            name="Total"
            stroke="var(--color-foreground)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ChartContainer>

      {!compact && (
        <DataTable
          columns={columns}
          data={rows}
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      )}
    </div>
  );
}
