import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import useTheme from '@mui/material/styles/useTheme';
import TextField from '@mui/material/TextField';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { currencyOptionsById } from '@lib/autoCompleteOptions';
import type { ExchangeRate } from '@server/exchangeRates/types';
import CurrencyAutocomplete from './CurrencyAutocomplete';

const id = 'exchange-rates-calculator';

type Props = {
  open: boolean;
  onClose: () => void;
  rates: ExchangeRate[];
};

export default function ExchangeRateCalculatorDialog({
  open,
  onClose,
  rates,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const ratesByCurrency = useMemo(
    () =>
      rates.reduce<Map<string, ExchangeRate>>((acc, rate) => {
        acc.set(rate.code, rate);
        return acc;
      }, new Map()),
    [rates],
  );

  const [fromCurrency, setFromCurrency] = useState(currencyOptionsById['EUR']);
  const [toCurrency, setToCurrency] = useState(currencyOptionsById['USD']);
  const [sourceAmount, setSourceAmount] = useState('1');
  const [targetAmount, setTargetAmount] = useState('1');
  useEffect(() => {
    setTargetAmount(
      convert({
        from: fromCurrency.id,
        to: toCurrency.id,
        amount: Number(sourceAmount),
        rates: ratesByCurrency,
      }).toString(),
    );
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      id={id}
      aria-labelledby={`${id}-title`}
      fullScreen={fullScreen}
      keepMounted={false}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle id={`${id}-title`}>Exchange rate calculator</DialogTitle>
      <DialogContent>
        <Stack direction="row" gap={3} alignItems="center">
          <Grid
            container
            rowGap={2}
            columnSpacing={2}
            justifyContent="center"
            paddingTop={1}
          >
            <Grid size={{ xs: 6 }}>
              <TextField
                value={sourceAmount}
                fullWidth
                type="number"
                onChange={(e) => {
                  setSourceAmount(e.target.value);
                  setTargetAmount(
                    convert({
                      from: fromCurrency.id,
                      to: toCurrency.id,
                      amount: parseFloat(e.target.value),
                      rates: ratesByCurrency,
                    }).toString(),
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CurrencyAutocomplete
                value={fromCurrency}
                onChange={(newFromCurrency) => {
                  setFromCurrency(newFromCurrency);
                  setTargetAmount(
                    convert({
                      from: newFromCurrency.id,
                      to: toCurrency.id,
                      amount: Number(sourceAmount),
                      rates: ratesByCurrency,
                    }).toString(),
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                value={targetAmount}
                fullWidth
                type="number"
                onChange={(e) => {
                  setTargetAmount(e.target.value);
                  setSourceAmount(
                    convert({
                      from: toCurrency.id,
                      to: fromCurrency.id,
                      amount: parseFloat(e.target.value),
                      rates: ratesByCurrency,
                    }).toString(),
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <CurrencyAutocomplete
                value={toCurrency}
                onChange={(newToCurrency) => {
                  setToCurrency(newToCurrency);
                  setSourceAmount(
                    convert({
                      from: newToCurrency.id,
                      to: fromCurrency.id,
                      amount: Number(targetAmount),
                      rates: ratesByCurrency,
                    }).toString(),
                  );
                }}
              />
            </Grid>
          </Grid>
          <IconButton
            onClick={() => {
              setSourceAmount(targetAmount);
              setTargetAmount(sourceAmount);
              setFromCurrency(toCurrency);
              setToCurrency(fromCurrency);
            }}
          >
            <SwapVertIcon />
          </IconButton>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type ConvertRateInput = {
  amount: number;
  from: string;
  to: string;
  rates: Map<string, ExchangeRate>;
};

function convert({ from, to, amount, rates }: ConvertRateInput) {
  const fromRate = rates.get(from)?.close || 1.0;
  const toRate = rates.get(to)?.close || 1.0;

  return (amount / fromRate) * toRate;
}
