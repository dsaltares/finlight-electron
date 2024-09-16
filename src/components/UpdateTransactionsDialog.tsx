import LoadingButton from '@mui/lab/LoadingButton';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type SubmitHandler, useForm, Controller } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import { useCallback, useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import createUTCDate from '@lib/createUTCDate';
import type { Category } from '@server/category/types';
import { isOptionEqualToValue } from '@lib/autoCompleteOptions';
import type {
  TransactionType,
  UpdateTransactionsInput,
} from '@server/transactions/types';
import TransactionTypeSelect from './TransactionTypeSelect';

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdate: (input: Omit<UpdateTransactionsInput, 'ids'>) => Promise<unknown>;
};

const id = 'update-transactions-dialog';

type Option = { label: string; id: string };

type TransactionFormValues = {
  amount: string;
  date: Date | null;
  description: string;
  type: TransactionType | '';
  category: Option | null;
};

type FormFieldName = keyof Omit<UpdateTransactionsInput, 'ids'>;

export default function UpdateTransactionsDialog({
  open,
  loading,
  categories,
  onClose,
  onUpdate,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        id: `${category.id}`,
      })),
    [categories],
  );
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TransactionFormValues>({
    mode: 'onBlur',
    defaultValues: {
      amount: '',
      date: null,
      type: '',
      description: '',
      category: null,
    },
  });
  const [enabledFields, setEnabledFields] = useState<
    Record<FormFieldName, boolean>
  >({} as Record<FormFieldName, boolean>);
  const onSubmit: SubmitHandler<TransactionFormValues> = useCallback(
    async (values) => {
      const processed = {
        ...values,
        date: createUTCDate(values.date!),
        categoryId: values.category?.id || null,
        amount: parseFloat(values.amount),
        type: values.type as TransactionType,
      };
      const hasEnabledFields = Object.values(enabledFields).some(
        (field) => !!field,
      );
      if (hasEnabledFields) {
        const data = Object.keys(enabledFields).reduce<
          Partial<typeof processed>
        >(
          (acc, field) =>
            enabledFields[field as FormFieldName]
              ? {
                  ...acc,
                  [field]: processed[field as FormFieldName],
                }
              : acc,
          {},
        );
        await onUpdate({
          ...data,
          categoryId: data.category ? parseInt(data.category.id, 10) : null,
        });
      }
      onClose();
    },
    [onUpdate, onClose, enabledFields],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      id={id}
      aria-labelledby={`${id}-title`}
      fullScreen={fullScreen}
      keepMounted={false}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle id={`${id}-title`}>Edit transactions</DialogTitle>
        <DialogContent>
          <Stack paddingY={1} gap={1.5}>
            <Stack direction="row" gap={0.5} alignItems="center">
              <Checkbox
                checked={!!enabledFields['amount']}
                onChange={(e) =>
                  setEnabledFields((enabled) => ({
                    ...enabled,
                    amount: e.target.checked,
                  }))
                }
              />
              <TextField
                fullWidth
                type="number"
                label="Amount"
                error={!!errors.amount}
                inputProps={{
                  step: 0.01,
                }}
                disabled={!enabledFields['amount']}
                {...register('amount')}
              />
            </Stack>
            <Stack direction="row" gap={0.5} alignItems="center">
              <Checkbox
                checked={!!enabledFields['date']}
                onChange={(e) =>
                  setEnabledFields((enabled) => ({
                    ...enabled,
                    date: e.target.checked,
                  }))
                }
              />
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="Date"
                    value={value}
                    onChange={(value) => onChange(value)}
                    disabled={!enabledFields['date']}
                    sx={{ width: '100%' }}
                  />
                )}
              />
            </Stack>
            <Stack direction="row" gap={0.5} alignItems="center">
              <Checkbox
                checked={!!enabledFields['description']}
                onChange={(e) =>
                  setEnabledFields((enabled) => ({
                    ...enabled,
                    description: e.target.checked,
                  }))
                }
              />
              <TextField
                fullWidth
                label="Description"
                error={!!errors.description}
                disabled={!enabledFields['description']}
                {...register('description')}
              />
            </Stack>
            <Stack direction="row" gap={0.5} alignItems="center">
              <Checkbox
                checked={!!enabledFields['type']}
                onChange={(e) =>
                  setEnabledFields((enabled) => ({
                    ...enabled,
                    type: e.target.checked,
                  }))
                }
              />
              <Controller
                control={control}
                name="type"
                render={({ field: { value, onChange } }) => (
                  <TransactionTypeSelect
                    value={value}
                    onChange={onChange}
                    disabled={!enabledFields['type']}
                  />
                )}
              />
            </Stack>
            <Stack direction="row" gap={0.5} alignItems="center">
              <Checkbox
                checked={!!enabledFields['categoryId']}
                onChange={(e) =>
                  setEnabledFields((enabled) => ({
                    ...enabled,
                    categoryId: e.target.checked,
                  }))
                }
              />
              <Controller
                control={control}
                name="category"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Autocomplete
                    fullWidth
                    id="category-autocomplete"
                    value={value}
                    onChange={(_event, newValue) => onChange(newValue!)}
                    options={categoryOptions}
                    isOptionEqualToValue={isOptionEqualToValue}
                    disabled={!enabledFields['categoryId']}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        error={!!errors.category}
                      />
                    )}
                    onBlur={onBlur}
                  />
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="secondary"
            loading={loading}
            disabled={!isValid}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
