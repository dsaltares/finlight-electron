'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeftRight } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import ExchangeRateCalculatorDialog from '@/components/ExchangeRateCalculatorDialog';
import { Button } from '@/components/ui/button';
import useDialog from '@/hooks/use-dialog';
import { useTRPC } from '@/lib/trpc';

export default function ExchangeRatesPage() {
  const {
    open: isCalculatorDialogOpen,
    onOpen: onCalculatorDialogOpen,
    onClose: onCalculatorDialogClose,
  } = useDialog();
  const trpc = useTRPC();
  const { data: rates } = useQuery(trpc.exchangeRates.list.queryOptions());
  const { mutate: refreshRates } = useMutation(
    trpc.exchangeRates.refresh.mutationOptions(),
  );
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-4">
        <Button onClick={onCalculatorDialogOpen}>Open Calculator</Button>
        <Button onClick={() => refreshRates()}>Refresh Rates</Button>
        <ExchangeRateCalculatorDialog
          open={isCalculatorDialogOpen}
          onClose={onCalculatorDialogClose}
          rates={rates || []}
        />
      </div>
      <div className="flex-1 flex items-end justify-center w-full">
        <EmptyState Icon={ArrowLeftRight}>
          No exchange rates yet. Refresh rates or add pairs to get started.
        </EmptyState>
      </div>
    </div>
  );
}
