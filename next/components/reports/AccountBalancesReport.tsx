'use client';

import { useQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useInsightsFilters from '@/hooks/useInsightsFilters';
import { formatAmount } from '@/lib/format';
import { useTRPC } from '@/lib/trpc';
import { cn } from '@/lib/utils';

const ACCOUNT_COLORS = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#EA580C', // Orange
  '#9333EA', // Purple
  '#0891B2', // Cyan
  '#DC2626', // Red
  '#CA8A04', // Yellow
  '#0F766E', // Teal
  '#DB2777', // Pink
  '#4F46E5', // Indigo
];

export default function AccountBalancesReport() {
  const trpc = useTRPC();
  const { queryInput, displayCurrency } = useInsightsFilters();
  const { data, isLoading } = useQuery(
    trpc.reports.getAccountBalancesReport.queryOptions(queryInput),
  );
  const currency = displayCurrency;

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
      <ChartContainer config={config} className="h-96 w-full">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" />
          <YAxis />
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
          <ChartLegend content={<ChartLegendContent />} />
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {accountNames.map((name) => (
                <TableHead key={name} className="text-right">
                  {name}
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.bucket}>
                <TableCell>{d.bucket}</TableCell>
                {accountNames.map((name) => (
                  <TableCell
                    key={name}
                    className={cn(
                      'text-right',
                      (d.positions[name] ?? 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600',
                    )}
                  >
                    {formatAmount(d.positions[name] ?? 0, currency)}
                  </TableCell>
                ))}
                <TableCell
                  className={cn(
                    'text-right',
                    d.total >= 0 ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {formatAmount(d.total, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
