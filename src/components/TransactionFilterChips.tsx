import stringToColor from 'string-to-color';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import PaymentIcon from '@mui/icons-material/Payment';
import PaidIcon from '@mui/icons-material/Paid';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import client from '@lib/client';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import createUTCDate from '@lib/createUTCDate';
import { formatDate } from '@lib/format';
import {
  type Period,
  PeriodLabels,
  isPeriod,
  isDateRange,
} from '@server/types';
import type { Account } from '@server/accounts/types';
import type { Category } from '@server/category/types';
import type { TransactionType } from '@server/transactions/types';
import { TransactionTypes } from '@server/transactions/types';

export default function TransactionFilterChips() {
  const theme = useTheme();
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const { data: accounts } = client.getAccounts.useQuery();
  const { data: categories } = client.getCategories.useQuery();

  const accountsById = useMemo(
    () =>
      (accounts?.accounts || []).reduce<Record<string, Account>>(
        (acc, account) => ({ ...acc, [account.id]: account }),
        {},
      ),
    [accounts],
  );
  const categoriesById = useMemo(
    () =>
      (categories || []).reduce<Record<string, Category>>(
        (acc, category) => ({ ...acc, [category.id]: category }),
        {},
      ),
    [categories],
  );

  const handleClearType = useCallback(
    () => setFilters({ type: undefined }),
    [setFilters],
  );
  const handleClearAccount = useCallback(
    (accountId: string) =>
      setFilters({
        accounts: filtersByField.accounts
          ?.split(',')
          .filter((id) => id !== accountId)
          .join(','),
      }),
    [setFilters, filtersByField],
  );
  const handleClearCategory = useCallback(
    (categoryId: string) =>
      setFilters({
        categories: filtersByField.categories
          ?.split(',')
          .filter((id) => id !== categoryId)
          .join(','),
      }),
    [filtersByField, setFilters],
  );
  const handleClearDescription = () => setFilters({ description: undefined });
  const handleClearAmount = () =>
    setFilters({ minAmount: undefined, maxAmount: undefined });
  const handleClearDate = () =>
    setFilters({ from: undefined, until: undefined });
  const handleClearPeriod = () => setFilters({ period: undefined });

  if (Object.keys(filtersByField).length === 0) {
    return null;
  }

  const hasAmount = !!filtersByField.minAmount || !!filtersByField.maxAmount;
  const onlyMax = !filtersByField.minAmount && !!filtersByField.maxAmount;
  const onlyMin = !!filtersByField.minAmount && !filtersByField.maxAmount;

  const hasDateRange = isDateRange({
    from: filtersByField.from,
    until: filtersByField.until,
  });
  const onlyFrom = !!filtersByField.from && !filtersByField.until;
  const onlyUntil = !filtersByField.from && !!filtersByField.until;

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
      {hasAmount && (
        <Chip
          variant="outlined"
          label={
            onlyMax
              ? `(-∞, ${filtersByField.maxAmount}]`
              : onlyMin
                ? `[${filtersByField.minAmount}, ∞)`
                : `[${filtersByField.minAmount}, ${filtersByField.maxAmount}]`
          }
          onDelete={handleClearAmount}
        />
      )}
      {filtersByField.accounts
        ?.split(',')
        .map((accountId) => (
          <Chip
            key={`account-${accountId}`}
            variant="outlined"
            label={accountsById[accountId].name}
            onDelete={() => handleClearAccount(accountId)}
          />
        ))}
      {!!filtersByField.type &&
        TransactionTypes.includes(filtersByField.type as TransactionType) && (
          <Chip
            variant="outlined"
            label={filtersByField.type}
            icon={
              filtersByField.type === 'Expense' ? (
                <PaymentIcon />
              ) : filtersByField.type === 'Income' ? (
                <PaidIcon />
              ) : (
                <SwapHorizIcon />
              )
            }
            onDelete={handleClearType}
          />
        )}
      {filtersByField.categories?.split(',').map(
        (categoryId) =>
          categoriesById[categoryId] && (
            <Chip
              key={`category-${categoryId}`}
              sx={{
                backgroundColor: stringToColor(categoriesById[categoryId].name),
                color: theme.palette.getContrastText(
                  stringToColor(categoriesById[categoryId].name),
                ),
              }}
              variant="outlined"
              label={categoriesById[categoryId].name}
              onDelete={() => handleClearCategory(categoryId)}
            />
          ),
      )}
      {!!filtersByField.description && (
        <Chip
          variant="outlined"
          label={`Description: *${filtersByField.description}*`}
          onDelete={handleClearDescription}
        />
      )}
    </Stack>
  );
}
