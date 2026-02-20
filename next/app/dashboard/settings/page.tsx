'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CurrencyAutocomplete, {
  currencyOptionsById,
} from '@/components/CurrencyAutocomplete';
import type { Option as ComboboxOption } from '@/components/combobox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTRPC } from '@/lib/trpc';

type SettingsFormValues = {
  defaultCurrency: ComboboxOption;
};

export default function SettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery(
    trpc.userSettings.get.queryOptions(),
  );

  const { mutateAsync: updateSettings, isPending } = useMutation(
    trpc.userSettings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.userSettings.get.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.list.queryKey(),
        });
        toast.success('Settings saved.');
      },
      onError: () => {
        toast.error('Failed to save settings.');
      },
    }),
  );

  const { control, handleSubmit } = useForm<SettingsFormValues>({
    values: {
      defaultCurrency:
        currencyOptionsById[settings?.defaultCurrency ?? 'EUR'] ??
        currencyOptionsById.EUR,
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    await updateSettings({ defaultCurrency: values.defaultCurrency.value });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 h-full"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
    >
      <div className="flex shrink-0 flex-row items-center justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner className="mr-1" /> : null}
          Save
        </Button>
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <Label htmlFor="default-currency">Default currency</Label>
        <Controller
          control={control}
          name="defaultCurrency"
          render={({ field: { value, onChange } }) => (
            <div id="default-currency">
              <CurrencyAutocomplete value={value} onChange={onChange} />
            </div>
          )}
        />
      </div>
    </form>
  );
}
