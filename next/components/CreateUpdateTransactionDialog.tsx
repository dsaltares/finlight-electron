'use client';

import { format } from 'date-fns';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import AccountAutocomplete from '@/components/AccountAutocomplete';
import CategoryAutocomplete from '@/components/CategoryAutocomplete';
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
import { Spinner } from '@/components/ui/spinner';
import { TransactionTypes } from '@/server/trpc/procedures/schema';
import type { RouterInput, RouterOutput } from '@/lib/trpc';

type Transaction = RouterOutput['transactions']['list'][number];
type Account = RouterOutput['accounts']['list']['accounts'][number];

type BaseDialogProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  accounts: Account[];
};

type CreateDialogProps = {
  onCreate: (input: RouterInput['transactions']['create']) => Promise<unknown>;
  transaction?: never;
  onUpdate?: never;
};

type UpdateDialogProps = {
  transaction: Transaction;
  onUpdate: (input: RouterInput['transactions']['update']) => Promise<unknown>;
  onCreate?: never;
};

type Props = BaseDialogProps & (CreateDialogProps | UpdateDialogProps);

type TransactionFormValues = {
  amount: string;
  date: string;
  description: string;
  type: string;
  categoryId: string;
  accountId: string;
};

export default function CreateUpdateTransactionDialog({
  open,
  loading,
  transaction,
  accounts,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const title = transaction ? 'Edit transaction' : 'Create transaction';

  const defaultAccountId = accounts[0] ? `${accounts[0].id}` : '';

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<TransactionFormValues>({
    mode: 'onBlur',
    defaultValues: {
      amount: transaction ? (transaction.amount / 100).toString() : '',
      date: transaction?.date ?? format(new Date(), 'yyyy-MM-dd'),
      description: transaction?.description ?? '',
      type: transaction?.type ?? 'Expense',
      categoryId: transaction?.categoryId ? `${transaction.categoryId}` : '',
      accountId: transaction ? `${transaction.accountId}` : defaultAccountId,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      amount: transaction ? (transaction.amount / 100).toString() : '',
      date: transaction?.date ?? format(new Date(), 'yyyy-MM-dd'),
      description: transaction?.description ?? '',
      type: transaction?.type ?? 'Expense',
      categoryId: transaction?.categoryId ? `${transaction.categoryId}` : '',
      accountId: transaction ? `${transaction.accountId}` : defaultAccountId,
    });
  }, [transaction, open, reset, defaultAccountId]);

  const onSubmit: SubmitHandler<TransactionFormValues> = async (values) => {
    const amountMajor = Number.parseFloat(values.amount);
    if (Number.isNaN(amountMajor)) return;

    const common = {
      amount: Math.round(amountMajor * 100),
      date: values.date,
      description: values.description,
      type: values.type as 'Income' | 'Expense' | 'Transfer',
      categoryId: values.categoryId
        ? Number.parseInt(values.categoryId, 10)
        : null,
    };

    if (transaction) {
      await onUpdate({ id: transaction.id, ...common });
    } else {
      await onCreate({
        ...common,
        accountId: Number.parseInt(values.accountId, 10),
      });
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
      <DialogContent id="create-update-transaction-dialog">
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
            <Label htmlFor="transaction-amount">Amount</Label>
            <Input
              id="transaction-amount"
              type="number"
              step="0.01"
              {...register('amount', { required: true })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="transaction-date">Date</Label>
            <Input
              id="transaction-date"
              type="date"
              {...register('date', { required: true })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="transaction-description">Description</Label>
            <Input id="transaction-description" {...register('description')} />
          </div>

          {!transaction ? (
            <div className="flex flex-col gap-1">
              <Label>Account</Label>
              <Controller
                control={control}
                name="accountId"
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <AccountAutocomplete value={value} onChange={onChange} />
                )}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <Label>Type</Label>
            <Controller
              control={control}
              name="type"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TransactionTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Category</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { value, onChange } }) => (
                <CategoryAutocomplete value={value} onChange={onChange} />
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
