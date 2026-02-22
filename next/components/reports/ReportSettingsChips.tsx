'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import useInsightsFilters from '@/hooks/useInsightsFilters';
import { formatDate } from '@/lib/format';
import { useTRPC } from '@/lib/trpc';
import { PeriodLabels, PeriodSchema } from '@/server/trpc/procedures/schema';
import type { Period } from '@/server/trpc/procedures/schema';

type Chip = {
  key: string;
  label: string;
  color?: string;
  onRemove?: () => void;
};

export default function ReportSettingsChips() {
  const trpc = useTRPC();
  const { filters, clearFilter, clearDateRange } = useInsightsFilters();
  const { data: accountsData } = useQuery(trpc.accounts.list.queryOptions({}));
  const { data: categoriesData } = useQuery(
    trpc.categories.list.queryOptions(),
  );

  const accountsById = useMemo(
    () =>
      Object.fromEntries((accountsData?.accounts ?? []).map((a) => [a.id, a])),
    [accountsData],
  );
  const categoriesById = useMemo(
    () => Object.fromEntries((categoriesData ?? []).map((c) => [c.id, c])),
    [categoriesData],
  );

  const chips: Chip[] = [];

  if (filters.period && PeriodSchema.safeParse(filters.period).success) {
    chips.push({
      key: 'period',
      label: PeriodLabels[filters.period as Period],
      onRemove: () => clearFilter('period'),
    });
  } else if (filters.dateFrom || filters.dateUntil) {
    const from = filters.dateFrom ? formatDate(filters.dateFrom) : null;
    const until = filters.dateUntil ? formatDate(filters.dateUntil) : null;
    const label =
      from && until
        ? `${from} – ${until}`
        : from
          ? `From ${from}`
          : `Until ${until}`;
    chips.push({ key: 'date', label, onRemove: clearDateRange });
  } else {
    chips.push({ key: 'period', label: 'All time' });
  }

  if (filters.accounts && filters.accounts.length > 0) {
    const first = accountsById[filters.accounts[0]]?.name ?? 'Account';
    const rest = filters.accounts.length - 1;
    chips.push({
      key: 'accounts',
      label: rest > 0 ? `${first} +${rest}` : first,
      onRemove: () => clearFilter('accounts'),
    });
  }

  if (filters.categories && filters.categories.length > 0) {
    const onRemove = () => clearFilter('categories');
    for (const id of filters.categories) {
      const cat = categoriesById[id];
      if (cat) {
        chips.push({
          key: `category-${id}`,
          label: cat.name,
          color: cat.color,
          onRemove,
        });
      }
    }
  }

  if (filters.granularity) {
    chips.push({
      key: 'granularity',
      label: filters.granularity,
      onRemove: () => clearFilter('granularity'),
    });
  } else {
    chips.push({ key: 'granularity', label: 'Monthly' });
  }

  if (filters.currency) {
    chips.push({
      key: 'currency',
      label: filters.currency,
      onRemove: () => clearFilter('currency'),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {chips.map((chip) =>
        chip.color ? (
          <Badge
            key={chip.key}
            className="gap-1 border-transparent pr-1 text-white"
            style={{ backgroundColor: chip.color }}
          >
            {chip.label}
            {chip.onRemove && (
              <button
                type="button"
                onClick={chip.onRemove}
                className="text-white/70 hover:text-white"
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ) : (
          <Badge
            key={chip.key}
            variant="outline"
            className={chip.onRemove ? 'gap-1 pr-1' : ''}
          >
            {chip.label}
            {chip.onRemove && (
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-foreground text-muted-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ),
      )}
    </div>
  );
}
