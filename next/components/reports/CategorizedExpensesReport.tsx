'use client';

import { useQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import { useMemo } from 'react';
import CategoryReport from '@/components/reports/CategoryReport';
import EmptyState from '@/components/EmptyState';
import { Spinner } from '@/components/ui/spinner';
import useInsightsFilters from '@/hooks/useInsightsFilters';
import { useTRPC } from '@/lib/trpc';

export default function CategorizedExpensesReport({
  compact,
}: {
  compact?: boolean;
} = {}) {
  const trpc = useTRPC();
  const { queryInput, displayCurrency } = useInsightsFilters();
  const { data, isLoading } = useQuery(
    trpc.reports.getCategoryReport.queryOptions({
      ...queryInput,
      type: 'Expense',
    }),
  );
  const { data: categories } = useQuery(trpc.categories.list.queryOptions());
  const colorMap = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.name, c.color])),
    [categories],
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!data || data.categories.length === 0) {
    return <EmptyState Icon={SearchX}>No transactions found</EmptyState>;
  }

  return (
    <CategoryReport
      data={data}
      variant="negative"
      currency={displayCurrency}
      colorMap={colorMap}
      compact={compact}
    />
  );
}
