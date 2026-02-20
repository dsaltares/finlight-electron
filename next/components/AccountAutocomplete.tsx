'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import Combobox from '@/components/combobox';
import { useTRPC } from '@/lib/trpc';

type Props = {
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
};

export default function AccountAutocomplete({
  value,
  onChange,
  fullWidth = true,
}: Props) {
  const trpc = useTRPC();
  const { data: accountsData } = useQuery(trpc.accounts.list.queryOptions({}));
  const accounts = accountsData?.accounts ?? [];

  const options = useMemo(
    () =>
      accounts.map((account) => ({
        label: account.name,
        value: `${account.id}`,
      })),
    [accounts],
  );

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select account..."
      emptyMessage="No accounts found."
      fullWidth={fullWidth}
    />
  );
}
