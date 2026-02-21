'use client';

import { useState } from 'react';
import CurrencyAutocomplete, {
  currencyOptionsById,
} from '@/components/CurrencyAutocomplete';
import type { Option as ComboboxOption } from '@/components/combobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useBudgetFilters from '@/hooks/useBudgetFilters';
import {
  PeriodLabels,
  TimeGranularities,
} from '@/server/trpc/procedures/schema';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function BudgetOptionsDialog({ open, onClose }: Props) {
  const { filters, displayCurrency, applySettings, clearSettings } =
    useBudgetFilters();

  const [period, setPeriod] = useState(filters.period ?? '');
  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? '');
  const [dateUntil, setDateUntil] = useState(filters.dateUntil ?? '');
  const [granularity, setGranularity] = useState(filters.granularity ?? '');
  const [currency, setCurrency] = useState<ComboboxOption>(
    currencyOptionsById[filters.currency ?? displayCurrency] ??
      currencyOptionsById.EUR,
  );

  const handleApply = () => {
    applySettings({
      period: period || null,
      dateFrom: dateFrom || null,
      dateUntil: dateUntil || null,
      granularity:
        granularity && granularity !== 'Monthly' ? granularity : null,
      currency:
        currency.value && currency.value !== displayCurrency
          ? currency.value
          : null,
    });
    onClose();
  };

  const handleClear = () => {
    clearSettings();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">Budget settings</DialogTitle>
        <DialogHeader>
          <h2 className="text-sm font-medium">Budget settings</h2>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Period</Label>
            <Select
              value={period}
              onValueChange={(v) => {
                setPeriod(v);
                setDateFrom('');
                setDateUntil('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PeriodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <Label>From</Label>
              <Input
                type="date"
                value={dateFrom}
                max={dateUntil || undefined}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPeriod('');
                }}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Label>Until</Label>
              <Input
                type="date"
                value={dateUntil}
                min={dateFrom || undefined}
                onChange={(e) => {
                  setDateUntil(e.target.value);
                  setPeriod('');
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Budget granularity</Label>
            <Select value={granularity} onValueChange={setGranularity}>
              <SelectTrigger>
                <SelectValue placeholder="Monthly" />
              </SelectTrigger>
              <SelectContent>
                {TimeGranularities.filter((g) => g !== 'Daily').map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Currency</Label>
            <CurrencyAutocomplete value={currency} onChange={setCurrency} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleClear}>
            Clear
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
