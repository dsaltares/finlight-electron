'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';
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

type BudgetBucket = {
  bucket: string;
  categories: Record<string, number>;
  budgetCategories: Record<string, number>;
  total: number;
  budgetTarget: number;
};

type CategoryRow = {
  category: string;
  amounts: Record<string, number>;
  total: number;
};

type Props = {
  data: BudgetBucket[];
  currency: string;
  variant?: 'positive' | 'negative';
  colorMap: Record<string, string>;
  compact?: boolean;
};

function getTrackingColor(
  actual: number,
  budget: number,
  variant: 'positive' | 'negative',
): string {
  if (budget === 0) return '';
  if (variant === 'negative') {
    return actual <= budget ? 'text-green-600' : 'text-red-600';
  }
  return actual >= budget ? 'text-green-600' : 'text-red-600';
}

export default function BudgetOverTimeSection({
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
      for (const name of Object.keys(d.budgetCategories)) {
        names.add(name);
      }
    }
    return [...names];
  }, [data]);

  const config: ChartConfig = {
    ...Object.fromEntries(
      categoryNames.map((name) => [
        name,
        { label: name, color: colorMap[name] ?? 'var(--color-chart-1)' },
      ]),
    ),
    total: { label: 'Total', color: 'var(--color-foreground)' },
    'Total (Budget)': {
      label: 'Total (Budget)',
      color: 'var(--color-foreground)',
    },
  };

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
          <span
            className={
              variant === 'positive' ? 'text-green-600' : 'text-red-600'
            }
          >
            {formatAmount(getValue<number>(), currency)}
          </span>
        ),
      })),
      {
        accessorKey: 'total',
        header: 'Total',
        meta: { align: 'right' } satisfies ColumnMeta,
        cell: ({ row }) => (
          <span
            className={cn(
              variant === 'positive' ? 'text-green-600' : 'text-red-600',
              'font-medium',
            )}
          >
            {formatAmount(row.original.total, currency)}
          </span>
        ),
      },
    ],
    [data, colorMap, variant, currency],
  );

  const grandTotal = data.reduce((sum, d) => sum + d.total, 0);
  const budgetTarget = data[0]?.budgetTarget ?? 0;
  const grandBudget = budgetTarget * data.length;

  const pinnedContent = (
    <>
      <TableRow className="font-medium">
        <TableCell className="sticky left-0 z-10 bg-background">
          Total
        </TableCell>
        {data.map((d) => (
          <TableCell
            key={d.bucket}
            className={cn(
              'text-right',
              getTrackingColor(d.total, d.budgetTarget, variant),
            )}
          >
            {formatAmount(d.total, currency)}
          </TableCell>
        ))}
        <TableCell
          className={cn(
            'text-right',
            getTrackingColor(grandTotal, grandBudget, variant),
          )}
        >
          {formatAmount(grandTotal, currency)}
        </TableCell>
      </TableRow>
      <TableRow className="font-medium text-muted-foreground">
        <TableCell className="sticky left-0 z-10 bg-background">
          Budget
        </TableCell>
        {data.map((d) => (
          <TableCell key={d.bucket} className="text-right">
            {formatAmount(d.budgetTarget, currency)}
          </TableCell>
        ))}
        <TableCell className="text-right">
          {formatAmount(grandBudget, currency)}
        </TableCell>
      </TableRow>
      <TableRow className="text-muted-foreground">
        <TableCell className="sticky left-0 z-10 bg-background">Diff</TableCell>
        {data.map((d) => {
          const diff = d.total - d.budgetTarget;
          return (
            <TableCell
              key={d.bucket}
              className={cn(
                'text-right',
                getTrackingColor(d.total, d.budgetTarget, variant),
              )}
            >
              {diff >= 0 ? '+' : ''}
              {formatAmount(diff, currency)}
            </TableCell>
          );
        })}
        <TableCell
          className={cn(
            'text-right',
            getTrackingColor(grandTotal, grandBudget, variant),
          )}
        >
          {grandTotal - grandBudget >= 0 ? '+' : ''}
          {formatAmount(grandTotal - grandBudget, currency)}
        </TableCell>
      </TableRow>
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer
        config={config}
        className={cn(
          'relative z-30 w-full',
          compact ? 'h-48' : 'h-96',
        )}
      >
        <ComposedChart data={data}>
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
                        backgroundColor: item.stroke || item.color || undefined,
                        opacity: String(item.name).includes('Budget') ? 0.4 : 1,
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
          <Area
            dataKey="budgetTarget"
            name="Total (Budget)"
            stroke="var(--color-foreground)"
            fill="var(--color-foreground)"
            fillOpacity={0.08}
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            type="monotone"
          />
          {categoryNames.length > 1 && (
            <Line
              dataKey="total"
              name="Total"
              stroke="var(--color-foreground)"
              type="monotone"
              dot={false}
              strokeWidth={2}
            />
          )}
          {categoryNames.map((name) => (
            <Line
              key={name}
              dataKey={`categories.${name}`}
              name={name}
              stroke={colorMap[name] ?? 'var(--color-chart-1)'}
              type="monotone"
              dot={false}
              strokeWidth={2}
            />
          ))}
        </ComposedChart>
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
