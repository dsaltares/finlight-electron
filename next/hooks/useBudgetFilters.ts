import { useQuery } from '@tanstack/react-query';
import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subQuarters,
} from 'date-fns';
import { parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';
import { useTRPC } from '@/lib/trpc';
import type { TimeGranularity } from '@/server/trpc/procedures/schema';

const filterParsers = {
  date: parseAsString,
  granularity: parseAsString,
  currency: parseAsString,
};

function getDateRange(date: string, granularity: string) {
  const d = new Date(date);
  switch (granularity) {
    case 'Yearly':
      return {
        from: format(startOfYear(d), 'yyyy-MM-dd'),
        until: format(endOfYear(d), 'yyyy-MM-dd'),
      };
    case 'Quarterly':
      return {
        from: format(startOfQuarter(d), 'yyyy-MM-dd'),
        until: format(endOfQuarter(d), 'yyyy-MM-dd'),
      };
    default:
      return {
        from: format(startOfMonth(d), 'yyyy-MM-dd'),
        until: format(endOfMonth(d), 'yyyy-MM-dd'),
      };
  }
}

export default function useBudgetFilters() {
  const trpc = useTRPC();
  const [filters, setFilters] = useQueryStates(filterParsers);
  const { data: userSettings } = useQuery(trpc.userSettings.get.queryOptions());

  const displayCurrency =
    filters.currency ?? userSettings?.defaultCurrency ?? 'EUR';

  const granularity = (filters.granularity as TimeGranularity) ?? 'Quarterly';
  const selectedDate =
    filters.date ??
    format(startOfQuarter(subQuarters(new Date(), 1)), 'yyyy-MM-dd');

  const queryInput = useMemo(() => {
    const range = getDateRange(selectedDate, granularity);
    return {
      date: range,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: filters.currency ?? undefined,
      granularity,
    };
  }, [selectedDate, granularity, filters.currency]);

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.date) count++;
    if (filters.granularity) count++;
    if (filters.currency) count++;
    return count;
  }, [filters]);

  const applySettings = useCallback(
    (values: {
      date: string | null;
      granularity: string | null;
      currency: string | null;
    }) => setFilters(values),
    [setFilters],
  );

  const clearSettings = useCallback(
    () =>
      setFilters({
        date: null,
        granularity: null,
        currency: null,
      }),
    [setFilters],
  );

  return {
    filters,
    queryInput,
    displayCurrency,
    selectedDate,
    filterCount,
    applySettings,
    clearSettings,
  };
}
