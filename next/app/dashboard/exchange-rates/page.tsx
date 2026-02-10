'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Calculator, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '@/components/EmptyState';
import ExchangeRateCalculatorDialog from '@/components/ExchangeRateCalculatorDialog';
import ExchangeRatesTable from '@/components/ExchangeRatesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import useDialog from '@/hooks/use-dialog';
import { useRateFilter } from '@/hooks/useFilters';
import { useTRPC } from '@/lib/trpc';

export default function ExchangeRatesPage() {
  const {
    open: isCalculatorDialogOpen,
    onOpen: onCalculatorDialogOpen,
    onClose: onCalculatorDialogClose,
  } = useDialog();
  const { rateFilter, setRateFilter } = useRateFilter();
  const trpc = useTRPC();
  const { data: rates, isLoading } = useQuery(
    trpc.exchangeRates.list.queryOptions(),
  );
  const { mutate: refreshRates, isPending: isRefreshing } = useMutation(
    trpc.exchangeRates.refresh.mutationOptions({
      onSuccess: () => {
        toast.success('Exchange rates refreshed');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to refresh exchange rates');
      },
    }),
  );

  const hasRates = rates && rates.length > 0;

  let content = null;
  if (isLoading) {
    content = (
      <div className="flex w-full justify-center items-center h-full">
        <Spinner />
      </div>
    );
  } else if (hasRates) {
    content = <ExchangeRatesTable rates={rates} />;
  } else {
    content = (
      <EmptyState Icon={ArrowLeftRight}>
        No exchange rates yet. Try refreshing the rates.
      </EmptyState>
    );
  }

  return (
    <div
      className="flex min-h-0 flex-col gap-4 overflow-hidden"
      style={{
        height: 'calc(100dvh - var(--header-height) - 2rem)',
      }}
    >
      <div className="flex shrink-0 flex-row items-center justify-between gap-3">
        <Input
          placeholder="Search..."
          value={rateFilter ?? ''}
          onChange={(e) => setRateFilter(e.target.value || null)}
          className="w-full"
        />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCalculatorDialogOpen}
            disabled={!hasRates}
            aria-label="Open calculator"
          >
            <Calculator className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refreshRates()}
            disabled={isRefreshing}
            aria-label="Refresh rates"
          >
            <RefreshCw
              className={isRefreshing ? 'size-4 animate-spin' : 'size-4'}
            />
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {content}
      </div>
      <ExchangeRateCalculatorDialog
        open={isCalculatorDialogOpen}
        onClose={onCalculatorDialogClose}
        rates={rates ?? []}
      />
    </div>
  );
}
