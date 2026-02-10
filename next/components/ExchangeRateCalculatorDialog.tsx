'use client';

import { ArrowLeftRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import CurrencyAutocomplete, {
  currencyOptionsById,
} from '@/components/CurrencyAutocomplete';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { ExchangeRate } from '@/server/trpc/procedures/exchangeRates';

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
  const ratesByCurrency = useMemo(
    () =>
      rates.reduce<Map<string, ExchangeRate>>((acc, rate) => {
        acc.set(rate.code, rate);
        return acc;
      }, new Map()),
    [rates],
  );

  const [fromCurrency, setFromCurrency] = useState(currencyOptionsById.EUR);
  const [toCurrency, setToCurrency] = useState(currencyOptionsById.USD);
  const [sourceAmount, setSourceAmount] = useState('1');
  const [targetAmount, setTargetAmount] = useState('1');

  useEffect(() => {
    if (!open) {
      return;
    }
    setTargetAmount(
      convert({
        from: fromCurrency.value,
        to: toCurrency.value,
        amount: Number(sourceAmount),
        rates: ratesByCurrency,
      }).toString(),
    );
  }, [
    open,
    fromCurrency.value,
    toCurrency.value,
    sourceAmount,
    ratesByCurrency,
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        id={id}
        aria-labelledby={`${id}-title`}
        className="sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle id={`${id}-title`}>Exchange rate calculator</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="grid flex-1 grid-cols-2 gap-3">
              <Input
                value={sourceAmount}
                type="number"
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSourceAmount(nextValue);
                  setTargetAmount(
                    convert({
                      from: fromCurrency.value,
                      to: toCurrency.value,
                      amount: parseFloat(nextValue),
                      rates: ratesByCurrency,
                    }).toString(),
                  );
                }}
              />
              <CurrencyAutocomplete
                value={fromCurrency}
                onChange={(newFromCurrency) => {
                  setFromCurrency(newFromCurrency);
                  setTargetAmount(
                    convert({
                      from: newFromCurrency.value,
                      to: toCurrency.value,
                      amount: Number(sourceAmount),
                      rates: ratesByCurrency,
                    }).toString(),
                  );
                }}
              />
              <Input
                value={targetAmount}
                type="number"
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setTargetAmount(nextValue);
                  setSourceAmount(
                    convert({
                      from: toCurrency.value,
                      to: fromCurrency.value,
                      amount: parseFloat(nextValue),
                      rates: ratesByCurrency,
                    }).toString(),
                  );
                }}
              />
              <CurrencyAutocomplete
                value={toCurrency}
                onChange={(newToCurrency) => {
                  setToCurrency(newToCurrency);
                  setSourceAmount(
                    convert({
                      from: newToCurrency.value,
                      to: fromCurrency.value,
                      amount: Number(targetAmount),
                      rates: ratesByCurrency,
                    }).toString(),
                  );
                }}
              />
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => {
                setSourceAmount(targetAmount);
                setTargetAmount(sourceAmount);
                setFromCurrency(toCurrency);
                setToCurrency(fromCurrency);
              }}
              aria-label="Swap currencies"
            >
              <ArrowLeftRight />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
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
