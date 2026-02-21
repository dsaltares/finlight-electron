import { useQuery } from '@tanstack/react-query';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import { useTRPC } from '@/lib/trpc';
import type {
  DateFilter,
  Period,
  TimeGranularity,
} from '@/server/trpc/procedures/schema';
import { PeriodSchema } from '@/server/trpc/procedures/schema';

const filterParsers = {
  report: parseAsString,
  period: parseAsString,
  dateFrom: parseAsString,
  dateUntil: parseAsString,
  accounts: parseAsArrayOf(parseAsInteger, ','),
  categories: parseAsArrayOf(parseAsInteger, ','),
  granularity: parseAsString,
  currency: parseAsString,
};

export default function useInsightsFilters() {
  const trpc = useTRPC();
  const [filters, setFilters] = useQueryStates(filterParsers);
  const { data: userSettings } = useQuery(trpc.userSettings.get.queryOptions());

  const report = filters.report ?? 'categorizedExpenses';
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
      accounts: filters.accounts ?? undefined,
      categories: filters.categories ?? undefined,
      currency: filters.currency ?? undefined,
      granularity: (filters.granularity as TimeGranularity) ?? undefined,
    }),
    [
      dateFilter,
      filters.accounts,
      filters.categories,
      filters.currency,
      filters.granularity,
    ],
  );

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.period) count++;
    if (filters.dateFrom || filters.dateUntil) count++;
    if (filters.accounts && filters.accounts.length > 0) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.granularity) count++;
    if (filters.currency) count++;
    return count;
  }, [filters]);

  const setReport = useCallback(
    (value: string) => setFilters({ report: value }),
    [setFilters],
  );

  const clearFilter = useCallback(
    (key: keyof typeof filterParsers) => setFilters({ [key]: null }),
    [setFilters],
  );

  const clearDateRange = useCallback(
    () => setFilters({ dateFrom: null, dateUntil: null }),
    [setFilters],
  );

  const applySettings = useCallback(
    (values: {
      period: string | null;
      dateFrom: string | null;
      dateUntil: string | null;
      accounts: number[] | null;
      categories: number[] | null;
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
        accounts: null,
        categories: null,
        granularity: null,
        currency: null,
      }),
    [setFilters],
  );

  return {
    filters,
    report,
    setReport,
    queryInput,
    displayCurrency,
    filterCount,
    clearFilter,
    clearDateRange,
    applySettings,
    clearSettings,
  };
}
