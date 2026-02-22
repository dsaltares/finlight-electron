'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

type CategoryBucket = {
  bucket: string;
  categories: Record<string, number>;
  total: number;
};

type CategoryRow = {
  category: string;
  amounts: Record<string, number>;
  total: number;
};

type Props = {
  data: CategoryBucket[];
  currency: string;
  variant?: 'positive' | 'negative';
  colorMap: Record<string, string>;
  compact?: boolean;
};

export default function CategoryOverTimeReport({
  data,
  currency,
  variant = 'negative',
  colorMap,
  compact,
}: Props) {
  const categoryNames = useMemo(() => {
    const names = new Set<string>();
    for (const d of data) {
      for (const name of Object.keys(d.categories)) {
        names.add(name);
      }
    }
    return [...names];
  }, [data]);

  const config: ChartConfig = Object.fromEntries(
    categoryNames.map((name) => [
      name,
      { label: name, color: colorMap[name] ?? 'var(--color-chart-1)' },
    ]),
  );

  const colorClass = variant === 'positive' ? 'text-green-600' : 'text-red-600';
  const { sorting, onSortingChange } = useSortFromUrl();

  const rows = useMemo<CategoryRow[]>(
    () =>
      categoryNames.map((name) => ({
        category: name,
        amounts: Object.fromEntries(
          data.map((d) => [d.bucket, d.categories[name] ?? 0]),
        ),
        total: data.reduce((sum, d) => sum + (d.categories[name] ?? 0), 0),
      })),
    [categoryNames, data],
  );

  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        accessorKey: 'category',
        header: 'Category',
        meta: { isSticky: true } satisfies ColumnMeta,
        cell: ({ row }) => (
          <Badge
            className="border-transparent text-white"
            style={{ backgroundColor: colorMap[row.original.category] }}
          >
            {row.original.category}
          </Badge>
        ),
      },
      ...data.map<ColumnDef<CategoryRow>>((d) => ({
        id: d.bucket,
        accessorFn: (row: CategoryRow) => row.amounts[d.bucket] ?? 0,
        header: d.bucket,
        meta: { align: 'right' } satisfies ColumnMeta,
        cell: ({ getValue }) => (
          <span className={colorClass}>
            {formatAmount(getValue<number>(), currency)}
          </span>
        ),
      })),
      {
        accessorKey: 'total',
        header: 'Total',
        meta: { align: 'right' } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span className={cn(colorClass, 'font-medium')}>
            {formatAmount(row.original.total, currency)}
          </span>
        ),
      },
    ],
    [data, colorMap, colorClass, currency],
  );

  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);

  const pinnedContent = (
    <TableRow className="font-medium">
      <TableCell className="sticky left-0 z-10 bg-background">Total</TableCell>
      {data.map((d) => (
        <TableCell key={d.bucket} className={cn('text-right', colorClass)}>
          {formatAmount(d.total, currency)}
        </TableCell>
      ))}
      <TableCell className={cn('text-right', colorClass)}>
        {formatAmount(grandTotal, currency)}
      </TableCell>
    </TableRow>
  );

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer
        config={config}
        className={compact ? 'h-48 w-full' : 'h-96 w-full'}
      >
        <BarChart data={data}>
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
          {categoryNames.map((name) => (
            <Bar
              key={name}
              dataKey={`categories.${name}`}
              name={name}
              stackId="a"
              fill={colorMap[name] ?? 'var(--color-chart-1)'}
            />
          ))}
        </BarChart>
      </ChartContainer>

      {!compact && (
        <DataTable
          columns={columns}
          data={rows}
          sorting={sorting}
          onSortingChange={onSortingChange}
          pinnedContent={pinnedContent}
        />
      )}
    </div>
  );
}
