'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAmount } from '@/lib/format';
import { cn } from '@/lib/utils';

type CategoryBucket = {
  bucket: string;
  categories: Record<string, number>;
  total: number;
};

type Props = {
  data: CategoryBucket[];
  currency: string;
  variant?: 'positive' | 'negative';
  colorMap: Record<string, string>;
};

export default function CategoryOverTimeReport({
  data,
  currency,
  variant = 'negative',
  colorMap,
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

  return (
    <div className="flex flex-col gap-4">
      <ChartContainer config={config} className="h-96 w-full">
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {categoryNames.map((name) => (
                <TableHead key={name} className="text-right">
                  <Badge
                    className="border-transparent text-white"
                    style={{ backgroundColor: colorMap[name] }}
                  >
                    {name}
                  </Badge>
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.bucket}>
                <TableCell>{d.bucket}</TableCell>
                {categoryNames.map((name) => (
                  <TableCell
                    key={name}
                    className={cn('text-right', colorClass)}
                  >
                    {formatAmount(d.categories[name] ?? 0, currency)}
                  </TableCell>
                ))}
                <TableCell className={cn('text-right', colorClass)}>
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
