'use client';

import { useQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import EmptyState from '@/components/EmptyState';
import {
  type ChartConfig,
  ChartContainer,
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

const chartConfig: ChartConfig = {
  income: { label: 'Income', color: '#16A34A' },
  expenses: { label: 'Expenses', color: '#DC2626' },
};

export default function IncomeVsExpensesReport() {
  const trpc = useTRPC();
  const { queryInput, displayCurrency } = useInsightsFilters();
  const { data, isLoading } = useQuery(
    trpc.reports.getIncomeVsExpensesReport.queryOptions(queryInput),
  );
  const currency = displayCurrency;

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
      <ChartContainer config={chartConfig} className="h-96 w-full">
        <BarChart data={data}>
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
          <Bar dataKey="income" fill="#16A34A" />
          <Bar dataKey="expenses" fill="#DC2626" />
        </BarChart>
      </ChartContainer>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.bucket}>
                <TableCell>{d.bucket}</TableCell>
                <TableCell className="text-right text-green-700 dark:text-green-400">
                  {formatAmount(d.income, currency)}
                </TableCell>
                <TableCell className="text-right text-red-700 dark:text-red-400">
                  {formatAmount(d.expenses, currency)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right',
                    d.difference > 0
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400',
                  )}
                >
                  {formatAmount(d.difference, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
