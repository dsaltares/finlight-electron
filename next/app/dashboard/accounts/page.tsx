'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Landmark, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AccountList from '@/components/AccountList';
import BalanceCard from '@/components/BalanceCard';
import CreateUpdateAccountDialog from '@/components/CreateUpdateAccountDialog';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import useDialog from '@/hooks/use-dialog';
import { useTRPC } from '@/lib/trpc';

export default function AccountsPage() {
  const trpc = useTRPC();
  const { data, isLoading: isLoadingAccounts } = useQuery(
    trpc.accounts.list.queryOptions({}),
  );
  const {
    open: isCreateDialogOpen,
    onOpen: onCreateDialogOpen,
    onClose: onCreateDialogClose,
  } = useDialog();

  const { mutateAsync: createAccount, isPending: isCreating } = useMutation(
    trpc.accounts.create.mutationOptions({
      onSuccess: () => {
        toast.success('Account created.');
      },
      onError: (error) => {
        toast.error(
          error.message
            ? `Failed to create account. ${error.message}`
            : 'Failed to create account.',
        );
      },
    }),
  );

  const accounts = data?.accounts ?? [];
  const total = data?.total;
  const currenciesCount = new Set(accounts.map((account) => account.currency))
    .size;

  const isLoading = isLoadingAccounts;
  const hasAccounts = accounts.length > 0;

  let content = null;
  if (isLoading) {
    content = (
      <div className="flex w-full justify-center items-center h-full">
        <Spinner />
      </div>
    );
  } else if (!hasAccounts) {
    content = (
      <EmptyState Icon={Landmark}>You don't have any accounts yet.</EmptyState>
    );
  } else {
    content = (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AccountList accounts={accounts} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-0 flex-col gap-4 overflow-hidden"
      style={{
        height: 'calc(100dvh - var(--header-height) - 2rem)',
      }}
    >
      <div className="flex flex-wrap items-start gap-3">
        {hasAccounts && total ? (
          <BalanceCard
            balanceInCents={total.value}
            currency={total.currency}
            accountsCount={accounts.length}
            currenciesCount={currenciesCount}
          />
        ) : null}
        <Button onClick={onCreateDialogOpen} className="ml-auto">
          <Plus className="size-4" />
          New account
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {content}
      </div>

      <CreateUpdateAccountDialog
        open={isCreateDialogOpen}
        loading={isCreating}
        onClose={onCreateDialogClose}
        onCreate={createAccount}
      />
    </div>
  );
}
