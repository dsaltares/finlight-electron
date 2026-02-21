'use client';

import { useQuery } from '@tanstack/react-query';
import { ListChecks } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import MultipleSelector, {
  type Option,
} from '@/components/ui/multiple-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useInsightsFilters from '@/hooks/useInsightsFilters';
import { useTRPC } from '@/lib/trpc';
import {
  PeriodLabels,
  TimeGranularities,
} from '@/server/trpc/procedures/schema';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReportSettingsDialog({ open, onClose }: Props) {
  const trpc = useTRPC();
  const { filters, displayCurrency, applySettings, clearSettings } =
    useInsightsFilters();
  const { data: accountsData } = useQuery(trpc.accounts.list.queryOptions({}));
  const { data: categoriesData } = useQuery(
    trpc.categories.list.queryOptions(),
  );
  const accounts = accountsData?.accounts ?? [];
  const categories = categoriesData ?? [];

  const accountOptions: Option[] = useMemo(
    () => accounts.map((a) => ({ value: String(a.id), label: a.name })),
    [accounts],
  );

  const categoryOptions: Option[] = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories],
  );

  const [period, setPeriod] = useState(filters.period ?? '');
  const [dateFrom, setDateFrom] = useState(filters.dateFrom ?? '');
  const [dateUntil, setDateUntil] = useState(filters.dateUntil ?? '');
  const [selectedAccounts, setSelectedAccounts] = useState<Option[]>(
    accountOptions.filter((o) =>
      (filters.accounts ?? []).includes(Number(o.value)),
    ),
  );
  const [selectedCategories, setSelectedCategories] = useState<Option[]>(
    categoryOptions.filter((o) =>
      (filters.categories ?? []).includes(Number(o.value)),
    ),
  );
  const [granularity, setGranularity] = useState(filters.granularity ?? '');
  const [currency, setCurrency] = useState<ComboboxOption>(
    currencyOptionsById[filters.currency ?? displayCurrency] ??
      currencyOptionsById.EUR,
  );

  const handleApply = () => {
    const accountIds = selectedAccounts.map((o) => Number(o.value));
    const categoryIds = selectedCategories.map((o) => Number(o.value));
    applySettings({
      period: period || null,
      dateFrom: dateFrom || null,
      dateUntil: dateUntil || null,
      accounts:
        accountIds.length > 0 && accountIds.length < accounts.length
          ? accountIds
          : null,
      categories:
        categoryIds.length > 0 && categoryIds.length < categories.length
          ? categoryIds
          : null,
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
        <DialogTitle className="sr-only">Report settings</DialogTitle>
        <DialogHeader>
          <h2 className="text-sm font-medium">Report settings</h2>
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

          {accounts.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label>Accounts</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => setSelectedAccounts(accountOptions)}
                      >
                        <ListChecks className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Select all</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <MultipleSelector
                value={selectedAccounts}
                defaultOptions={accountOptions}
                onChange={setSelectedAccounts}
                placeholder="All accounts"
                hidePlaceholderWhenSelected
              />
            </div>
          )}

          {categories.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label>Categories</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => setSelectedCategories(categoryOptions)}
                      >
                        <ListChecks className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Select all</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <MultipleSelector
                value={selectedCategories}
                defaultOptions={categoryOptions}
                onChange={setSelectedCategories}
                placeholder="All categories"
                hidePlaceholderWhenSelected
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label>Time granularity</Label>
            <Select value={granularity} onValueChange={setGranularity}>
              <SelectTrigger>
                <SelectValue placeholder="Monthly" />
              </SelectTrigger>
              <SelectContent>
                {TimeGranularities.map((g) => (
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
