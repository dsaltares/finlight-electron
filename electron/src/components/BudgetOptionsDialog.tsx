import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import createUTCDate from '@lib/createUTCDate';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import { currencyOptionsById } from '@lib/autoCompleteOptions';
import { TimeGranularities, type TimeGranularity } from '@server/budget/types';
import client from '@lib/client';
import DefaultCurrency from '@lib/defaultCurrency';
import TimeGranularitySelect from './TimeGranularitySelect';
import CurrencyAutocomplete from './CurrencyAutocomplete';

type Props = {
  open: boolean;
  onClose: () => void;
};

const id = 'budget-options-dialog';

export default function BudgetOptionsDialog({ open, onClose }: Props) {
  const { data: settings } = client.getUserSettings.useQuery();
  const defaultCurrency = settings?.currency ?? DefaultCurrency;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const [date, setDate] = useState<Date | null>(
    typeof filtersByField.date === 'string'
      ? createUTCDate(filtersByField.date)
      : createUTCDate(),
  );
  const [granularity, setGranularity] = useState<TimeGranularity | ''>(
    (filtersByField.granularity as TimeGranularity) || '',
  );
  const [currency, setCurrency] = useState(
    currencyOptionsById[filtersByField.currency ?? defaultCurrency],
  );

  const handleApplyFilters = () => {
    setFilters({
      date: date?.toISOString(),
      currency: currency.id !== defaultCurrency ? currency.id : undefined,
      granularity,
    });
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({
      date: undefined,
      currency: undefined,
      granularity: undefined,
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
      <DialogTitle id={`${id}-title`}>Budget options</DialogTitle>
      <DialogContent>
        <Stack paddingY={1} gap={1.75}>
          <Stack gap={2}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(date) => {
                setDate(date);
              }}
              disableFuture
              format="dd/MM/yyyy"
            />
            <TimeGranularitySelect
              value={granularity}
              onChange={(newGranularity) =>
                setGranularity(newGranularity as TimeGranularity)
              }
              granularities={[...TimeGranularities]}
            />
            <CurrencyAutocomplete value={currency} onChange={setCurrency} />
          </Stack>
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
