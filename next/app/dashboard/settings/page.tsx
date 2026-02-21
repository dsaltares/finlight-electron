'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CurrencyAutocomplete, {
  currencyOptionsById,
} from '@/components/CurrencyAutocomplete';
import type { Option as ComboboxOption } from '@/components/combobox';
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

  const [showSaved, setShowSaved] = useState(false);
  const isDirtyRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { mutate: save, isPending: isSaving } = useMutation(
    trpc.userSettings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.userSettings.get.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.accounts.list.queryKey(),
        });
        setShowSaved(true);
        clearTimeout(savedTimeoutRef.current);
        savedTimeoutRef.current = setTimeout(() => setShowSaved(false), 2000);
      },
      onError: () => {
        toast.error('Failed to save settings.');
      },
    }),
  );

  const { control, watch, handleSubmit } = useForm<SettingsFormValues>({
    values: {
      defaultCurrency:
        currencyOptionsById[settings?.defaultCurrency ?? 'EUR'] ??
        currencyOptionsById.EUR,
    },
  });

  const onSubmit = useCallback(
    (values: SettingsFormValues) => {
      save({ defaultCurrency: values.defaultCurrency.value });
    },
    [save],
  );

  useEffect(() => {
    const subscription = watch(() => {
      if (!isDirtyRef.current) return;
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        handleSubmit(onSubmit)();
        isDirtyRef.current = false;
      }, 1000);
    });
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, onSubmit]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex shrink-0 flex-row items-center justify-end">
        <div className="flex size-5 shrink-0 items-center justify-center">
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : showSaved ? (
            <Check className="size-3.5 text-muted-foreground" />
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <Label htmlFor="default-currency">Default currency</Label>
        <Controller
          control={control}
          name="defaultCurrency"
          render={({ field: { value, onChange } }) => (
            <div id="default-currency">
              <CurrencyAutocomplete
                value={value}
                onChange={(v) => {
                  isDirtyRef.current = true;
                  onChange(v);
                }}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
