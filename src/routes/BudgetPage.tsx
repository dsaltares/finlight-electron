import Stack from '@mui/material/Stack';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { keepPreviousData } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import client from '@lib/client';
import type { BudgetEntry, TimeGranularity } from '@server/budget/types';
import AppName from '@lib/appName';
import { formatDateWithGranularity } from '@lib/format';
import createUTCDate from '@lib/createUTCDate';
import useDialog from '@components/useDialog';
import BudgetTable from '@components/BudgetTable';
import BudgetOptionsDialog from '@components/BudgetOptionsDialog';

type BudgetFormValues = {
  entries: BudgetEntry[];
};

export default function BudgetPage() {
  const {
    open: isOptionsDialogOpen,
    onOpen: onOptionsDialogOpen,
    onClose: onOptionsDialogClose,
  } = useDialog();
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const { data: budget, isLoading: isLoadingBudget } =
    client.getBudget.useQuery(
      {
        granularity: filtersByField.granularity as TimeGranularity,
        currency: filtersByField.currency,
        date: filtersByField.date,
      },
      {
        staleTime: Infinity,
        placeholderData: keepPreviousData,
      },
    );
  const { mutate: updateBudget, isPending: isUpdating } =
    client.updateBudget.useMutation();
  const { control } = useForm<BudgetFormValues>({
    mode: 'onBlur',
    defaultValues: {
      entries: budget?.entries || [],
    },
  });
  const {
    fields: entries,
    update: updateEntry,
    replace: replaceEntries,
  } = useFieldArray({
    control,
    name: 'entries',
  });
  useEffect(
    () => replaceEntries(budget?.entries || []),
    [budget, replaceEntries],
  );
  const handleUpdateBudget = () =>
    updateBudget({
      entries,
      granularity: filtersByField.granularity as TimeGranularity,
      currency: filtersByField.currency,
    });

  const isLoading = isLoadingBudget || !budget;

  let content = null;
  if (isLoading) {
    content = <FullScreenSpinner />;
  } else {
    content = <BudgetTable entries={entries} onUpdateEntry={updateEntry} />;
  }

  return (
    <>
      <Helmet>
        <title>{`Budget - ${AppName}`}</title>
      </Helmet>
      <Stack gap={2} height="100%">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={3}
        >
          <Stack direction="row" gap={2} alignItems="center" width="100%">
            <Typography variant="h6" whiteSpace="nowrap">
              {formatDateWithGranularity(
                filtersByField.date || createUTCDate(),
                (filtersByField.granularity as TimeGranularity) ||
                  budget?.granularity ||
                  'Monthly',
              )}
            </Typography>
            <TextField
              placeholder="Search..."
              value={filtersByField.search || ''}
              onChange={(e) => setFilters({ search: e.target.value })}
              size="small"
              fullWidth
            />
          </Stack>
          <Stack direction="row" gap={1}>
            <IconButton color="primary" onClick={handleUpdateBudget}>
              {isUpdating ? <CircularProgress size={24} /> : <SaveIcon />}
            </IconButton>
            <Badge
              badgeContent={Object.keys(filtersByField).length}
              color="secondary"
            >
              <IconButton color="primary" onClick={onOptionsDialogOpen}>
                <FilterAltIcon />
              </IconButton>
            </Badge>
          </Stack>
        </Stack>
        {content}
        <BudgetOptionsDialog
          open={isOptionsDialogOpen}
          onClose={onOptionsDialogClose}
        />
      </Stack>
    </>
  );
}
