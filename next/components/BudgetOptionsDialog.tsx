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
import { TimeGranularities } from '@/server/trpc/procedures/schema';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function BudgetOptionsDialog({ open, onClose }: Props) {
  const {
    filters,
    queryInput,
    displayCurrency,
    selectedDate,
    applySettings,
    clearSettings,
  } = useBudgetFilters();

  const [date, setDate] = useState(selectedDate);
  const [granularity, setGranularity] = useState(
    queryInput.granularity as string,
  );
  const [currency, setCurrency] = useState<ComboboxOption>(
    currencyOptionsById[filters.currency ?? displayCurrency] ??
      currencyOptionsById.EUR,
  );

  const handleApply = () => {
    applySettings({
      date: date || null,
      granularity: granularity || null,
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
        <DialogTitle className="sr-only">Budget options</DialogTitle>
        <DialogHeader>
          <h2 className="text-sm font-medium">Budget options</h2>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Time granularity</Label>
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
