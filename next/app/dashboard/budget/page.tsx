'use client';

import { IconAdjustments } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, Search } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import BudgetOptionsDialog from '@/components/BudgetOptionsDialog';
import BudgetTable, { type BudgetEntry } from '@/components/BudgetTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useDialog from '@/hooks/use-dialog';
import useBudgetFilters from '@/hooks/useBudgetFilters';
import { formatDateWithGranularity } from '@/lib/format';
import { useTRPC } from '@/lib/trpc';

export default function BudgetPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    open: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDialog();
  const { queryInput, displayCurrency, selectedDate } = useBudgetFilters();
  const [search, setSearch] = useQueryState('q', { defaultValue: '' });
  const [localEntries, setLocalEntries] = useState<BudgetEntry[] | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const isDirtyRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { data, isLoading } = useQuery(
    trpc.budget.get.queryOptions(queryInput),
  );

  useEffect(() => {
    if (data) {
      setLocalEntries(data.entries);
      isDirtyRef.current = false;
    }
  }, [data]);

  const entries = localEntries ?? data?.entries ?? [];

  const periodLabel = useMemo(() => {
    const granularity =
      queryInput.granularity || data?.granularity || 'Monthly';
    return formatDateWithGranularity(selectedDate, granularity);
  }, [selectedDate, queryInput.granularity, data?.granularity]);

  const { mutate: save, isPending: isSaving } = useMutation(
    trpc.budget.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.budget.get.queryKey() });
        setShowSaved(true);
        clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setShowSaved(false), 2000);
      },
      onError: () => {
        toast.error('Failed to save budget');
      },
    }),
  );

  const handleSave = useCallback(() => {
    save({
      granularity: queryInput.granularity ?? data?.granularity,
      currency: displayCurrency,
      entries: entries.map((e) => ({
        categoryId: e.categoryId,
        type: e.type,
        target: e.target,
      })),
    });
  }, [
    save,
    queryInput.granularity,
    data?.granularity,
    displayCurrency,
    entries,
  ]);

  const handleUpdateEntry = useCallback(
    ({
      categoryId,
      field,
      value,
    }: {
      categoryId: number;
      field: 'type' | 'target';
      value: string | number;
    }) => {
      setLocalEntries((prev) => {
        if (!prev) return prev;
        return prev.map((e) => {
          if (e.categoryId !== categoryId) return e;
          if (field === 'type')
            return { ...e, type: value as 'Income' | 'Expense' };
          return { ...e, target: value as number };
        });
      });
      isDirtyRef.current = true;
    },
    [],
  );

  useEffect(() => {
    if (!isDirtyRef.current) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
      isDirtyRef.current = false;
    }, 1000);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [handleSave]);

  return (
    <div
      className="flex min-h-0 flex-col gap-4 overflow-hidden"
      style={{
        height: 'calc(100dvh - var(--header-height) - 2rem)',
      }}
    >
      <div className="flex shrink-0 flex-row items-center gap-2">
        <span className="shrink-0 text-sm font-medium">{periodLabel}</span>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex size-5 shrink-0 items-center justify-center">
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : showSaved ? (
            <Check className="size-3.5 text-muted-foreground" />
          ) : null}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsOpen}
                className="relative"
              >
                <IconAdjustments className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Budget options</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No categories found. Create categories first.
          </div>
        ) : (
          <BudgetTable
            entries={entries}
            onUpdateEntry={handleUpdateEntry}
            currency={displayCurrency}
            search={search}
          />
        )}
      </div>

      {isSettingsOpen && (
        <BudgetOptionsDialog open={isSettingsOpen} onClose={onSettingsClose} />
      )}
    </div>
  );
}
