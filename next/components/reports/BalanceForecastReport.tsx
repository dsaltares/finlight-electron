'use client';

import { useQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from 'recharts';
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
import { formatAmount } from '@/lib/format';
import { useTRPC } from '@/lib/trpc';

const chartConfig: ChartConfig = {
  balance: { label: 'Balance', color: 'var(--color-primary)' },
  forecast: { label: 'Forecast', color: 'var(--color-muted-foreground)' },
};

export default function BalanceForecastReport({
  compact,
}: {
  compact?: boolean;
} = {}) {
  const trpc = useTRPC();
  const { queryInput, displayCurrency } = useInsightsFilters();
  const { data, isLoading } = useQuery(
    trpc.reports.getBalanceForecastReport.queryOptions(queryInput),
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
    <ChartContainer
      config={chartConfig}
      className={compact ? 'h-48 w-full' : 'h-96 w-full'}
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
        <Area
          dataKey="forecast"
          name="forecast"
          stroke="var(--color-muted-foreground)"
          fill="var(--color-muted)"
          strokeDasharray="3 3"
        />
        <Bar
          dataKey="balance"
          name="balance"
          barSize={20}
          fill="var(--color-primary)"
        />
      </ComposedChart>
    </ChartContainer>
  );
}
