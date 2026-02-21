'use client';

import { Cell, Pie, PieChart } from 'recharts';
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
};

export default function CategoryReport({
  data,
  variant = 'negative',
  currency,
  colorMap,
}: Props) {
  const config: ChartConfig = Object.fromEntries(
    data.categories.map((c) => [
      c.name,
      { label: c.name, color: colorMap[c.name] ?? 'var(--color-chart-1)' },
    ]),
  );
  const colorClass = variant === 'positive' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="flex h-full flex-col items-start gap-4 lg:flex-row lg:items-stretch">
      <ChartContainer
        config={config}
        className="mx-auto aspect-square h-80 shrink-0 lg:mx-0 lg:flex-1"
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 bg-background">
                Category
              </TableHead>
              <TableHead className="sticky top-0 bg-background text-right">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="font-medium">
              <TableCell>Total</TableCell>
              <TableCell className={cn('text-right', colorClass)}>
                {formatAmount(data.total, currency)}
              </TableCell>
            </TableRow>
            {data.categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Badge
                    className="border-transparent text-white"
                    style={{ backgroundColor: colorMap[c.name] }}
                  >
                    {c.name}
                  </Badge>
                </TableCell>
                <TableCell className={cn('text-right', colorClass)}>
                  {formatAmount(c.value, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
