'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { type ColumnMeta, DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TableCell, TableRow } from '@/components/ui/table';
import useSortFromUrl from '@/hooks/useSortFromUrl';
import { formatAmount } from '@/lib/format';
import { cn } from '@/lib/utils';

type CategoryAggregate = {
  id: number;
  name: string;
  value: number;
};

type Props = {
  data: { categories: CategoryAggregate[]; total: number };
  variant?: 'positive' | 'negative';
  currency: string;
  colorMap: Record<string, string>;
  compact?: boolean;
};

export default function CategoryReport({
  data,
  variant = 'negative',
  currency,
  colorMap,
  compact,
}: Props) {
  const config: ChartConfig = Object.fromEntries(
    data.categories.map((c) => [
      c.name,
      { label: c.name, color: colorMap[c.name] ?? 'var(--color-chart-1)' },
    ]),
  );
  const colorClass = variant === 'positive' ? 'text-green-600' : 'text-red-600';
  const { sorting, onSortingChange } = useSortFromUrl();

  const columns = useMemo<ColumnDef<CategoryAggregate>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Category',
        cell: ({ row }) => (
          <Badge
            className="border-transparent text-white"
            style={{ backgroundColor: colorMap[row.original.name] }}
          >
            {row.original.name}
          </Badge>
        ),
      },
      {
        accessorKey: 'value',
        header: 'Amount',
        meta: { align: 'right' } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span className={colorClass}>
            {formatAmount(row.original.value, currency)}
          </span>
        ),
      },
    ],
    [colorMap, colorClass, currency],
  );

  const pinnedContent = (
    <TableRow className="font-medium">
      <TableCell>Total</TableCell>
      <TableCell className={cn('text-right', colorClass)}>
        {formatAmount(data.total, currency)}
      </TableCell>
    </TableRow>
  );

  const chart = (
    <ChartContainer
      config={config}
      className={
        compact
          ? 'h-48 w-full'
          : 'mx-auto aspect-square h-80 shrink-0 lg:mx-0 lg:flex-1'
      }
    >
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="name"
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
        <Pie
          data={data.categories}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="70%"
        >
          {data.categories.map((entry) => (
            <Cell
              key={entry.id}
              fill={colorMap[entry.name] ?? 'var(--color-chart-1)'}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );

  if (compact) return chart;

  return (
    <div className="flex h-full flex-col items-start gap-4 lg:flex-row lg:items-stretch">
      {chart}
      <div className="min-h-0 flex-1">
        <DataTable
          columns={columns}
          data={data.categories}
          sorting={sorting}
          onSortingChange={onSortingChange}
          pinnedContent={pinnedContent}
        />
      </div>
    </div>
  );
}
