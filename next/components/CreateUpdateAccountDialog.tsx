'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import CSVImportPresetAutocomplete from '@/components/CSVImportPresetAutocomplete';
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
import { Spinner } from '@/components/ui/spinner';
import type { RouterInput, RouterOutput } from '@/lib/trpc';
import { useTRPC } from '@/lib/trpc';

type Account = RouterOutput['accounts']['list']['accounts'][number];

type BaseDialogProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
};

type CreateDialogProps = {
  onCreate: (input: RouterInput['accounts']['create']) => Promise<unknown>;
  account?: never;
  onUpdate?: never;
};

type UpdateDialogProps = {
  account: Account;
  onUpdate: (input: RouterInput['accounts']['update']) => Promise<unknown>;
  onCreate?: never;
};

type Props = BaseDialogProps & (CreateDialogProps | UpdateDialogProps);

type AccountFormValues = {
  name: string;
  initialBalance: string;
  currency: ComboboxOption;
  csvImportPresetId: string;
};

export default function CreateUpdateAccountDialog({
  open,
  loading,
  account,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const trpc = useTRPC();
  const { data: settings } = useQuery(trpc.userSettings.get.queryOptions());
  const defaultCurrency = settings?.defaultCurrency ?? 'EUR';

  const title = account ? 'Edit account' : 'Create account';

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<AccountFormValues>({
    mode: 'onBlur',
    defaultValues: {
      name: account?.name ?? '',
      initialBalance: ((account?.initialBalance ?? 0) / 100).toString(),
      currency: currencyOptionsById[account?.currency ?? defaultCurrency],
      csvImportPresetId: account?.csvImportPresetId
        ? `${account.csvImportPresetId}`
        : '',
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: account?.name ?? '',
      initialBalance: ((account?.initialBalance ?? 0) / 100).toString(),
      currency: currencyOptionsById[account?.currency ?? defaultCurrency],
      csvImportPresetId: account?.csvImportPresetId
        ? `${account.csvImportPresetId}`
        : '',
    });
  }, [account, open, reset]);

  const onSubmit: SubmitHandler<AccountFormValues> = async (values) => {
    const name = values.name.trim();
    const initialBalanceMajor = Number.parseFloat(values.initialBalance);
    if (!name || Number.isNaN(initialBalanceMajor)) {
      return;
    }

    const payload = {
      name,
      initialBalance: Math.round(initialBalanceMajor * 100),
      currency: values.currency.value,
      csvImportPresetId: values.csvImportPresetId
        ? Number.parseInt(values.csvImportPresetId, 10)
        : null,
    };

    if (account) {
      await onUpdate({ id: account.id, ...payload });
    } else {
      await onCreate(payload);
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent id="create-update-account-dialog">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
        >
          <DialogHeader>
            <h2 className="text-sm font-medium">{title}</h2>
          </DialogHeader>

          <div className="flex flex-col gap-1">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              {...register('name', { required: true })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="account-currency">Currency</Label>
            <Controller
              control={control}
              name="currency"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <div id="account-currency">
                  <CurrencyAutocomplete value={value} onChange={onChange} />
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="account-initial-balance">Initial balance</Label>
            <Input
              id="account-initial-balance"
              type="number"
              step="0.01"
              {...register('initialBalance', { required: true })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="account-preset">Import preset</Label>
            <Controller
              control={control}
              name="csvImportPresetId"
              render={({ field: { value, onChange } }) => (
                <div id="account-preset">
                  <CSVImportPresetAutocomplete
                    value={value}
                    onChange={onChange}
                  />
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? <Spinner className="mr-1" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
