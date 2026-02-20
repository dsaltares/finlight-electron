import {
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';
import type { Period, TransactionType } from '@/server/trpc/procedures/schema';

const filterParsers = {
  accounts: parseAsArrayOf(parseAsInteger, ','),
  categories: parseAsArrayOf(parseAsInteger, ','),
  type: parseAsString,
  description: parseAsString,
  minAmount: parseAsInteger,
  maxAmount: parseAsInteger,
  period: parseAsString,
  dateFrom: parseAsString,
  dateUntil: parseAsString,
};

export default function useTransactionFilters() {
  const [filters, setFilters] = useQueryStates(filterParsers);

  const queryInput = useMemo(() => {
    let date: Period | { from?: string; until?: string } | undefined;
    if (filters.period) {
      date = filters.period as Period;
    } else if (filters.dateFrom || filters.dateUntil) {
      date = {
        from: filters.dateFrom ?? undefined,
        until: filters.dateUntil ?? undefined,
      };
    }

    return {
      date,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      accounts: filters.accounts ?? undefined,
      categories: filters.categories ?? undefined,
      type: (filters.type as TransactionType) ?? undefined,
      description: filters.description ?? undefined,
      minAmount: filters.minAmount ?? undefined,
      maxAmount: filters.maxAmount ?? undefined,
    };
  }, [filters]);

  const hasFilters = useMemo(
    () => Object.values(filters).some((value) => value !== null),
    [filters],
  );

  const clearFilters = useCallback(() => {
    setFilters({
      accounts: null,
      categories: null,
      type: null,
      description: null,
      minAmount: null,
      maxAmount: null,
      period: null,
      dateFrom: null,
      dateUntil: null,
    });
  }, [setFilters]);

  const setAccount = useCallback(
    (accountId: number) => {
      const current = filters.accounts ?? [];
      const next = current.includes(accountId)
        ? current.filter((id) => id !== accountId)
        : [...current, accountId];
      setFilters({ accounts: next.length > 0 ? next : null });
    },
    [filters.accounts, setFilters],
  );

  const setCategory = useCallback(
    (categoryId: number) => {
      const current = filters.categories ?? [];
      const next = current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId];
      setFilters({ categories: next.length > 0 ? next : null });
    },
    [filters.categories, setFilters],
  );

  const setType = useCallback(
    (type: TransactionType) => {
      setFilters({ type: filters.type === type ? null : type });
    },
    [filters.type, setFilters],
  );

  const removeAccount = useCallback(
    (accountId: number) => {
      const next = (filters.accounts ?? []).filter((id) => id !== accountId);
      setFilters({ accounts: next.length > 0 ? next : null });
    },
    [filters.accounts, setFilters],
  );

  const removeCategory = useCallback(
    (categoryId: number) => {
      const next = (filters.categories ?? []).filter((id) => id !== categoryId);
      setFilters({ categories: next.length > 0 ? next : null });
    },
    [filters.categories, setFilters],
  );

  const removeType = useCallback(() => {
    setFilters({ type: null });
  }, [setFilters]);

  const removeDescription = useCallback(() => {
    setFilters({ description: null });
  }, [setFilters]);

  const removePeriod = useCallback(() => {
    setFilters({ period: null });
  }, [setFilters]);

  const removeDateRange = useCallback(() => {
    setFilters({ dateFrom: null, dateUntil: null });
  }, [setFilters]);

  return {
    filters,
    queryInput,
    hasFilters,
    setFilters,
    clearFilters,
    setAccount,
    setCategory,
    setType,
    removeAccount,
    removeCategory,
    removeType,
    removeDescription,
    removePeriod,
    removeDateRange,
  };
}

export const serializeTransactionFilters = createSerializer(filterParsers);
