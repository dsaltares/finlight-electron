'use client';

import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useMemo } from 'react';
import FilterChip from '@/components/FilterChip';
import { typeConfig } from '@/components/TransactionTypePill';
import { Badge } from '@/components/ui/badge';
import useTransactionFilters from '@/hooks/useTransactionFilters';
import { useTRPC } from '@/lib/trpc';
import {
  PeriodLabels,
  type Period,
  type TransactionType,
} from '@/server/trpc/procedures/schema';

export default function TransactionFilterChips() {
  const trpc = useTRPC();
  const {
    filters,
    hasFilters,
    removeAccount,
    removeCategory,
    removeType,
    removeDescription,
    removePeriod,
    removeDateRange,
  } = useTransactionFilters();

  const { data: accountsData } = useQuery(trpc.accounts.list.queryOptions({}));
  const { data: categories } = useQuery(trpc.categories.list.queryOptions());
  const accounts = accountsData?.accounts ?? [];

  const accountsById = useMemo(
    () => new Map(accounts.map((a) => [a.id, a])),
    [accounts],
  );

  const categoriesById = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c])),
    [categories],
  );

  if (!hasFilters) return null;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
      {filters.period ? (
        <FilterChip
          label={PeriodLabels[filters.period as Period] ?? filters.period}
          onRemove={removePeriod}
        />
      ) : null}
      {filters.dateFrom || filters.dateUntil ? (
        <FilterChip
          label={`${filters.dateFrom ?? '...'} — ${filters.dateUntil ?? '...'}`}
          onRemove={removeDateRange}
        />
      ) : null}
      {filters.accounts?.map((accountId) => {
        const account = accountsById.get(accountId);
        if (!account) return null;
        return (
          <FilterChip
            key={`account-${accountId}`}
            label={account.name}
            onRemove={() => removeAccount(accountId)}
          />
        );
      })}
      {filters.type ? (
        <TypeFilterChip
          type={filters.type as TransactionType}
          onRemove={removeType}
        />
      ) : null}
      {filters.categories?.map((categoryId) => {
        const category = categoriesById.get(categoryId);
        if (!category) return null;
        return (
          <FilterChip
            key={`category-${categoryId}`}
            label={category.name}
            color={category.color}
            onRemove={() => removeCategory(categoryId)}
          />
        );
      })}
      {filters.description ? (
        <FilterChip
          label={`"${filters.description}"`}
          onRemove={removeDescription}
        />
      ) : null}
    </div>
  );
}

function TypeFilterChip({
  type,
  onRemove,
}: {
  type: TransactionType;
  onRemove: () => void;
}) {
  const { icon: Icon, className } = typeConfig[type];
  return (
    <Badge variant="secondary" className={`gap-1 pr-1 ${className}`}>
      <Icon className="size-3" />
      {type}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex items-center hover:opacity-70"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
