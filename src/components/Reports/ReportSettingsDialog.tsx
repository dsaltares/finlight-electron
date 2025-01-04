import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import createUTCDate from '@lib/createUTCDate';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import { currencyOptionsById } from '@lib/autoCompleteOptions';
import type { TimeGranularity } from '@server/reports/types';
import { isPeriod, type Period } from '@server/types';
import type { Category } from '@server/category/types';
import type { Account } from '@server/accounts/types';
import PeriodSelect from '@components/PeriodSelect';
import AccountAutocomplete from '@components/AccountAutocomplete';
import CategoryAutocomplete from '@components/CategoryAutocomplete';
import TimeGranularitySelect from '@components/TimeGranularitySelect';
import CurrencyAutocomplete from '@components/CurrencyAutocomplete';

type Props = {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
};

const id = 'report-filter-dialog';
const DefaultCurrency = 'EUR';
const DefaultGranularity: TimeGranularity = 'Monthly';

export default function ReportSettingsDialog({
  open,
  onClose,
  accounts,
  categories,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const [from, setFrom] = useState(
    typeof filtersByField.from === 'string'
      ? createUTCDate(filtersByField.from)
      : undefined,
  );
  const [until, setUntil] = useState(
    typeof filtersByField.until === 'string'
      ? createUTCDate(filtersByField.until)
      : undefined,
  );
  const [period, setPeriod] = useState<Period | ''>(
    isPeriod(filtersByField.period) ? filtersByField.period : '',
  );
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity | ''>(
    (filtersByField.timeGranularity as TimeGranularity) ?? '',
  );
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>(
    filtersByField.accounts
      ? filtersByField.accounts.split(',').map(Number)
      : [],
  );
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    filtersByField.categories
      ? filtersByField.categories.split(',').map(Number)
      : [],
  );
  const [currency, setCurrency] = useState(
    currencyOptionsById[filtersByField.currency ?? DefaultCurrency],
  );

  const handleApplyFilters = () => {
    setFilters({
      period: period || undefined,
      from: from ? startOfDay(from).toISOString() : undefined,
      until: until ? endOfDay(until).toISOString() : undefined,
      accounts:
        selectedAccounts.length > 0 && selectedAccounts.length < accounts.length
          ? selectedAccounts.join(',')
          : undefined,
      categories:
        selectedCategories.length > 0 &&
        selectedCategories.length < categories.length
          ? selectedCategories.join(',')
          : undefined,
      currency: currency.id !== DefaultCurrency ? currency.id : undefined,
      timeGranularity:
        timeGranularity === DefaultGranularity ? undefined : timeGranularity,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({
      from: undefined,
      until: undefined,
      period: undefined,
      accounts: undefined,
      categories: undefined,
      currency: undefined,
      timeGranularity: undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      id={id}
      aria-labelledby={`${id}-title`}
      fullScreen={fullScreen}
      keepMounted={false}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id={`${id}-title`}>Report settings</DialogTitle>
      <DialogContent>
        <Stack paddingY={1} gap={1.75}>
          <Stack gap={1}>
            <PeriodSelect
              id="period-select"
              label="Period"
              value={period}
              onChange={(period) => {
                setPeriod(period);
                setFrom(undefined);
                setUntil(undefined);
              }}
            />
            <Stack direction="row" gap={1}>
              <DatePicker
                label="From"
                value={from}
                onChange={(date) => {
                  setFrom(date || undefined);
                  setPeriod('');
                }}
                maxDate={until}
                format="dd/MM/yyyy"
                sx={{ width: '100%' }}
              />
              <DatePicker
                label="Until"
                value={until}
                onChange={(date) => {
                  setUntil(date || undefined);
                  setPeriod('');
                }}
                minDate={from}
                format="dd/MM/yyyy"
                sx={{ width: '100%' }}
              />
            </Stack>
          </Stack>
          <AccountAutocomplete
            accounts={accounts}
            selected={selectedAccounts}
            onChange={setSelectedAccounts}
          />
          <CategoryAutocomplete
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
          <TimeGranularitySelect
            value={timeGranularity}
            onChange={setTimeGranularity}
          />
          <CurrencyAutocomplete value={currency} onChange={setCurrency} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="outlined" color="error" onClick={handleClearFilters}>
          Clear
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          onClick={handleApplyFilters}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
