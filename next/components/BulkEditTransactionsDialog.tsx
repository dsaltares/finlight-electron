'use client';

import { format } from 'date-fns';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import CategoryAutocomplete from '@/components/CategoryAutocomplete';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

type BulkEditFields = {
  amount?: number;
  date?: string;
  description?: string;
  type?: 'Income' | 'Expense' | 'Transfer';
  categoryId?: number | null;
};

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onUpdate: (fields: BulkEditFields) => Promise<unknown>;
};

type FormValues = {
  amountEnabled: boolean;
  amount: string;
  dateEnabled: boolean;
  date: string;
  descriptionEnabled: boolean;
  description: string;
  typeEnabled: boolean;
  type: string;
  categoryEnabled: boolean;
  categoryId: string;
};

export default function BulkEditTransactionsDialog({
  open,
  loading,
  onClose,
  onUpdate,
}: Props) {
  const { control, register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      amountEnabled: false,
      amount: '',
      dateEnabled: false,
      date: format(new Date(), 'yyyy-MM-dd'),
      descriptionEnabled: false,
      description: '',
      typeEnabled: false,
      type: 'Expense',
      categoryEnabled: false,
      categoryId: '',
    },
  });

  const amountEnabled = watch('amountEnabled');
  const dateEnabled = watch('dateEnabled');
  const descriptionEnabled = watch('descriptionEnabled');
  const typeEnabled = watch('typeEnabled');
  const categoryEnabled = watch('categoryEnabled');

  const hasAnyEnabled =
    amountEnabled ||
    dateEnabled ||
    descriptionEnabled ||
    typeEnabled ||
    categoryEnabled;

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const fields: BulkEditFields = {};
    if (values.amountEnabled && values.amount) {
      const parsed = Number.parseFloat(values.amount);
      if (!Number.isNaN(parsed)) {
        fields.amount = Math.round(parsed * 100);
      }
    }
    if (values.dateEnabled && values.date) {
      fields.date = values.date;
    }
    if (values.descriptionEnabled) {
      fields.description = values.description;
    }
    if (values.typeEnabled && values.type) {
      fields.type = values.type as 'Income' | 'Expense' | 'Transfer';
    }
    if (values.categoryEnabled) {
      fields.categoryId = values.categoryId
        ? Number.parseInt(values.categoryId, 10)
        : null;
    }
    await onUpdate(fields);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent id="bulk-edit-transactions-dialog">
        <DialogTitle className="sr-only">Edit transactions</DialogTitle>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
        >
          <DialogHeader>
            <h2 className="text-sm font-medium">Edit transactions</h2>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="amountEnabled"
              render={({ field: { value, onChange } }) => (
                <Checkbox checked={value} onCheckedChange={onChange} />
              )}
            />
            <Label htmlFor="bulk-amount" className="w-24 shrink-0">
              Amount
            </Label>
            <Input
              id="bulk-amount"
              type="number"
              step="0.01"
              disabled={!amountEnabled}
              {...register('amount')}
            />
          </div>

          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="dateEnabled"
              render={({ field: { value, onChange } }) => (
                <Checkbox checked={value} onCheckedChange={onChange} />
              )}
            />
            <Label htmlFor="bulk-date" className="w-24 shrink-0">
              Date
            </Label>
            <Input
              id="bulk-date"
              type="date"
              disabled={!dateEnabled}
              {...register('date')}
            />
          </div>

          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="descriptionEnabled"
              render={({ field: { value, onChange } }) => (
                <Checkbox checked={value} onCheckedChange={onChange} />
              )}
            />
            <Label htmlFor="bulk-description" className="w-24 shrink-0">
              Description
            </Label>
            <Input
              id="bulk-description"
              disabled={!descriptionEnabled}
              {...register('description')}
            />
          </div>

          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="typeEnabled"
              render={({ field: { value, onChange } }) => (
                <Checkbox checked={value} onCheckedChange={onChange} />
              )}
            />
            <Label className="w-24 shrink-0">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  onValueChange={onChange}
                  disabled={!typeEnabled}
                >
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

          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="categoryEnabled"
              render={({ field: { value, onChange } }) => (
                <Checkbox checked={value} onCheckedChange={onChange} />
              )}
            />
            <Label className="w-24 shrink-0">Category</Label>
            <div className="flex-1">
              <Controller
                control={control}
                name="categoryId"
                render={({ field: { value, onChange } }) => (
                  <CategoryAutocomplete value={value} onChange={onChange} />
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasAnyEnabled}>
              {loading ? <Spinner className="mr-1" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
