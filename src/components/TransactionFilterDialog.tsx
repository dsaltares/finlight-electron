import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Autocomplete from '@mui/material/Autocomplete';
import { useMemo, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import createUTCDate from '@lib/createUTCDate';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import type { Category } from '@server/category/types';
import { isOptionEqualToValue } from '@lib/autoCompleteOptions';
import { isPeriod, type Period } from '@server/types';
import type { Account } from '@server/accounts/types';
import type { TransactionType } from '@server/transactions/types';
import PeriodSelect from './PeriodSelect';
import TransactionTypeSelect from './TransactionTypeSelect';

type Props = {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
};

const id = 'transaction-filter-dialog';

export default function TransactionFilterDialog({
  open,
  onClose,
  accounts,
  categories,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        label: account.name,
        id: `${account.id}`,
      })),
    [accounts],
  );
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        id: `${category.id}`,
      })),
    [categories],
  );
  const [account, setAccount] = useState(
    () =>
      accountOptions.find((option) => option.id === filtersByField.accountId) ||
      null,
  );
  const [type, setType] = useState<TransactionType | ''>(() =>
    filtersByField.type ? (filtersByField.type as TransactionType) : '',
  );
  const [category, setCategory] = useState(
    () =>
      categoryOptions.find(
        (option) => option.id === filtersByField.categoryId,
      ) || null,
  );
  const [description, setDescription] = useState(filtersByField.description);
  const [period, setPeriod] = useState<Period | ''>(
    isPeriod(filtersByField.period) ? filtersByField.period : '',
  );
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
  const [minAmount, setMinAmount] = useState(filtersByField.minAmount);
  const [maxAmount, setMaxAmount] = useState(filtersByField.maxAmount);
  const handleApplyFilters = () => {
    setFilters({
      period: period || undefined,
      from: from ? startOfDay(from).toISOString() : undefined,
      until: until ? endOfDay(until).toISOString() : undefined,
      minAmount,
      maxAmount,
      type: type || undefined,
      accountId: account?.id,
      categoryId: category?.id,
      description: description || undefined,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({
      from: undefined,
      until: undefined,
      period: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      accountId: undefined,
      type: undefined,
      categoryId: undefined,
      description: undefined,
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
    >
      <DialogTitle id={`${id}-title`}>Transaction filters</DialogTitle>
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
              />
            </Stack>
          </Stack>
          <Stack direction="row" gap={1}>
            <TextField
              fullWidth
              type="number"
              label="Min amount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              slotProps={{
                htmlInput: {
                  step: 0.01,
                },
              }}
            />
            <TextField
              fullWidth
              type="number"
              label="Max amount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              slotProps={{
                htmlInput: {
                  step: 0.01,
                },
              }}
            />
          </Stack>
          <Autocomplete
            id="account-autocomplete"
            value={account}
            onChange={(_event, newValue) => setAccount(newValue)}
            options={accountOptions}
            isOptionEqualToValue={isOptionEqualToValue}
            renderInput={(params) => <TextField {...params} label="Account" />}
          />
          <TransactionTypeSelect value={type} onChange={setType} clearable />
          <Autocomplete
            id="category-autocomplete"
            value={category}
            onChange={(_event, newValue) => setCategory(newValue)}
            options={categoryOptions}
            isOptionEqualToValue={isOptionEqualToValue}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />
          <TextField
            label="Description"
            defaultValue={description}
            onChange={(event) => setDescription(event.target.value)}
          />
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
