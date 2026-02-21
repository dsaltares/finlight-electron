import { useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';
import { useTRPC } from '@/lib/trpc';
import type {
  DateFilter,
  Period,
  TimeGranularity,
} from '@/server/trpc/procedures/schema';
import { PeriodSchema } from '@/server/trpc/procedures/schema';

const filterParsers = {
  period: parseAsString,
  dateFrom: parseAsString,
  dateUntil: parseAsString,
  granularity: parseAsString,
  currency: parseAsString,
};

export default function useBudgetFilters() {
  const trpc = useTRPC();
  const [filters, setFilters] = useQueryStates(filterParsers);
  const { data: userSettings } = useQuery(trpc.userSettings.get.queryOptions());

  const displayCurrency =
    filters.currency ?? userSettings?.defaultCurrency ?? 'EUR';

  const dateFilter = useMemo((): DateFilter | undefined => {
    if (filters.period && PeriodSchema.safeParse(filters.period).success) {
      return filters.period as Period;
    }
    if (filters.dateFrom || filters.dateUntil) {
      return {
        from: filters.dateFrom ?? undefined,
        until: filters.dateUntil ?? undefined,
      };
    }
    return undefined;
  }, [filters.period, filters.dateFrom, filters.dateUntil]);

  const queryInput = useMemo(
    () => ({
      date: dateFilter,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: filters.currency ?? undefined,
      granularity: (filters.granularity as TimeGranularity) ?? undefined,
    }),
    [dateFilter, filters.currency, filters.granularity],
  );

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.period) count++;
    if (filters.dateFrom || filters.dateUntil) count++;
    if (filters.granularity) count++;
    if (filters.currency) count++;
    return count;
  }, [filters]);

  const applySettings = useCallback(
    (values: {
      period: string | null;
      dateFrom: string | null;
      dateUntil: string | null;
      granularity: string | null;
      currency: string | null;
    }) => setFilters(values),
    [setFilters],
  );

  const clearSettings = useCallback(
    () =>
      setFilters({
        period: null,
        dateFrom: null,
        dateUntil: null,
        granularity: null,
        currency: null,
      }),
    [setFilters],
  );

  return {
    filters,
    queryInput,
    displayCurrency,
    filterCount,
    applySettings,
    clearSettings,
  };
}
