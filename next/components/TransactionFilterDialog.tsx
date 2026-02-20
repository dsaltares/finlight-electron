'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import MultiSelectPopover from '@/components/MultiSelectPopover';
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
import useTransactionFilters from '@/hooks/useTransactionFilters';
import { useTRPC } from '@/lib/trpc';
import {
  PeriodLabels,
  Periods,
  TransactionTypes,
} from '@/server/trpc/procedures/schema';

type Props = {
  open: boolean;
  onClose: () => void;
};

type LocalFilters = {
  period: string;
  dateFrom: string;
  dateUntil: string;
  minAmount: string;
  maxAmount: string;
  accounts: number[];
  type: string;
  categories: number[];
  description: string;
};

const ALL_TYPES_VALUE = '__all__';
const NO_PERIOD_VALUE = '__none__';

export default function TransactionFilterDialog({ open, onClose }: Props) {
  const trpc = useTRPC();
  const { filters, setFilters } = useTransactionFilters();

  const { data: accountsData } = useQuery(trpc.accounts.list.queryOptions({}));
  const { data: categories } = useQuery(trpc.categories.list.queryOptions());
  const accounts = accountsData?.accounts ?? [];

  const [local, setLocal] = useState<LocalFilters>({
    period: '',
    dateFrom: '',
    dateUntil: '',
    minAmount: '',
    maxAmount: '',
    accounts: [],
    type: '',
    categories: [],
    description: '',
  });

  useEffect(() => {
    if (!open) return;
    setLocal({
      period: filters.period ?? '',
      dateFrom: filters.dateFrom ?? '',
      dateUntil: filters.dateUntil ?? '',
      minAmount: filters.minAmount != null ? `${filters.minAmount}` : '',
      maxAmount: filters.maxAmount != null ? `${filters.maxAmount}` : '',
      accounts: filters.accounts ?? [],
      type: filters.type ?? '',
      categories: filters.categories ?? [],
      description: filters.description ?? '',
    });
  }, [open, filters]);

  const handleApply = () => {
    setFilters({
      period: local.period || null,
      dateFrom: !local.period && local.dateFrom ? local.dateFrom : null,
      dateUntil: !local.period && local.dateUntil ? local.dateUntil : null,
      minAmount: local.minAmount ? Number.parseInt(local.minAmount, 10) : null,
      maxAmount: local.maxAmount ? Number.parseInt(local.maxAmount, 10) : null,
      accounts: local.accounts.length > 0 ? local.accounts : null,
      type: local.type || null,
      categories: local.categories.length > 0 ? local.categories : null,
      description: local.description || null,
    });
    onClose();
  };

  const handleClear = () => {
    setFilters({
      period: null,
      dateFrom: null,
      dateUntil: null,
      minAmount: null,
      maxAmount: null,
      accounts: null,
      type: null,
      categories: null,
      description: null,
    });
    onClose();
  };

  const toggleAccount = (id: number) => {
    setLocal((prev) => ({
      ...prev,
      accounts: prev.accounts.includes(id)
        ? prev.accounts.filter((a) => a !== id)
        : [...prev.accounts, id],
    }));
  };

  const toggleCategory = (id: number) => {
    setLocal((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent id="transaction-filter-dialog">
        <DialogTitle className="sr-only">Filter transactions</DialogTitle>
        <DialogHeader>
          <h2 className="text-sm font-medium">Filter transactions</h2>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>Period</Label>
            <Select
              value={local.period || NO_PERIOD_VALUE}
              onValueChange={(v) =>
                setLocal((prev) => ({
                  ...prev,
                  period: v === NO_PERIOD_VALUE ? '' : v,
                  dateFrom: v !== NO_PERIOD_VALUE ? '' : prev.dateFrom,
                  dateUntil: v !== NO_PERIOD_VALUE ? '' : prev.dateUntil,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PERIOD_VALUE}>No period</SelectItem>
                {Periods.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PeriodLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Date range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={local.dateFrom}
                disabled={!!local.period}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, dateFrom: e.target.value }))
                }
              />
              <span className="text-muted-foreground text-sm">—</span>
              <Input
                type="date"
                value={local.dateUntil}
                disabled={!!local.period}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, dateUntil: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Amount range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={local.minAmount}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, minAmount: e.target.value }))
                }
              />
              <span className="text-muted-foreground text-sm">—</span>
              <Input
                type="number"
                placeholder="Max"
                value={local.maxAmount}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, maxAmount: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Accounts</Label>
            <MultiSelectPopover
              items={accounts.map((a) => ({ id: a.id, label: a.name }))}
              selected={local.accounts}
              onToggle={toggleAccount}
              placeholder="All accounts"
              emptyMessage="No accounts found."
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Type</Label>
            <Select
              value={local.type || ALL_TYPES_VALUE}
              onValueChange={(v) =>
                setLocal((prev) => ({
                  ...prev,
                  type: v === ALL_TYPES_VALUE ? '' : v,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TYPES_VALUE}>All types</SelectItem>
                {TransactionTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Categories</Label>
            <MultiSelectPopover
              items={(categories ?? []).map((c) => ({
                id: c.id,
                label: c.name,
                color: c.color,
              }))}
              selected={local.categories}
              onToggle={toggleCategory}
              placeholder="All categories"
              emptyMessage="No categories found."
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="filter-description">Description</Label>
            <Input
              id="filter-description"
              value={local.description}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Contains..."
            />
          </div>
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={handleClear}>
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
