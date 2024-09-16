import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import createUTCDate from '@lib/createUTCDate';
import client from '@lib/client';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import { formatDate } from '@lib/format';
import {
  type Period,
  PeriodLabels,
  isDateRange,
  isPeriod,
} from '@server/types';
import type { Category } from '@server/category/types';
import type { Account } from '@server/accounts/types';

export default function ReportSettingsChips() {
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const { data: accounts } = client.getAccounts.useQuery();
  const { data: categories } = client.getCategories.useQuery();

  const accountsById = useMemo(
    () =>
      (accounts?.accounts || []).reduce<Record<number, Account>>(
        (acc, account) => ({ ...acc, [account.id]: account }),
        {},
      ),
    [accounts],
  );
  const categoriesById = useMemo(
    () =>
      (categories || []).reduce<Record<number, Category>>(
        (acc, category) => ({ ...acc, [category.id]: category }),
        {},
      ),
    [categories],
  );

  const handleClearAccounts = () => setFilters({ accounts: undefined });
  const handleClearCategories = () => setFilters({ categories: undefined });
  const handleClearPeriod = () => setFilters({ period: undefined });
  const handleClearDate = () =>
    setFilters({ from: undefined, until: undefined });
  const handleClearTimeGranularity = () =>
    setFilters({ timeGranularity: undefined });

  if (Object.keys(filtersByField).length === 0) {
    return null;
  }

  const hasDateRange = isDateRange({
    from: filtersByField.from,
    until: filtersByField.until,
  });
  const onlyFrom = !!filtersByField.from && !filtersByField.until;
  const onlyUntil = !filtersByField.from && !!filtersByField.until;
  const selectedAccounts =
    filtersByField.accounts?.split(',').map(Number) || [];
  const selectedCategories =
    filtersByField.categories?.split(',').map(Number) || [];

  return (
    <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2}>
      {isPeriod(filtersByField.period) && (
        <Chip
          variant="outlined"
          label={PeriodLabels[filtersByField.period as Period]}
          onDelete={handleClearPeriod}
        />
      )}
      {hasDateRange && (
        <Chip
          variant="outlined"
          label={
            onlyFrom
              ? `From ${formatDate(
                  createUTCDate(filtersByField.from as string),
                )}`
              : onlyUntil
                ? `Until ${formatDate(
                    createUTCDate(filtersByField.until as string),
                  )}`
                : `Between ${formatDate(
                    createUTCDate(filtersByField.from as string),
                  )} and ${formatDate(
                    createUTCDate(filtersByField.until as string),
                  )}`
          }
          onDelete={handleClearDate}
        />
      )}
      {selectedAccounts.length > 0 && (
        <Chip
          variant="outlined"
          label={
            selectedAccounts.length === 1
              ? accountsById[selectedAccounts[0]].name
              : `${accountsById[selectedAccounts[0]].name} and ${
                  selectedAccounts.length - 1
                } more`
          }
          onDelete={handleClearAccounts}
        />
      )}
      {selectedCategories.length > 0 && (
        <Chip
          variant="outlined"
          label={
            selectedCategories.length === 1
              ? categoriesById[selectedCategories[0]]?.name
              : `${categoriesById[selectedCategories[0]]?.name} and ${
                  selectedCategories.length - 1
                } more`
          }
          onDelete={handleClearCategories}
        />
      )}
      {!!filtersByField.timeGranularity && (
        <Chip
          variant="outlined"
          label={filtersByField.timeGranularity}
          onDelete={handleClearTimeGranularity}
        />
      )}
    </Stack>
  );
}
