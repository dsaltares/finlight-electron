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
import { useCallback, useMemo } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { startOfToday } from 'date-fns/startOfToday';
import Autocomplete from '@mui/material/Autocomplete';
import createUTCDate from '@lib/createUTCDate';
import type { Category } from '@server/category/types';
import { isOptionEqualToValue } from '@lib/autoCompleteOptions';
import type { Account } from '@server/accounts/types';
import type {
  CreateTransactionInput,
  Transaction,
  TransactionType,
  UpdateTransactionInput,
} from '@server/transactions/types';
import TransactionTypeSelect from './TransactionTypeSelect';

type BaseProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
};

type CreateProps = {
  onCreate: (input: CreateTransactionInput) => Promise<unknown>;
  transaction?: never;
  onUpdate?: never;
};

type EditProps = {
  transaction: Transaction;
  onUpdate: (input: UpdateTransactionInput) => Promise<unknown>;
  onCreate?: never;
};

type Props = BaseProps & (CreateProps | EditProps);

const id = 'create-update-transaction-dialog';

type Option = { label: string; id: string };

type TransactionFormValues = {
  amount: string;
  date: Date | null;
  description: string;
  type: TransactionType;
  category: Option | null;
  account: Option;
};

export default function CreateUpdateTransactionDialog({
  open,
  loading,
  transaction,
  categories,
  accounts,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { accountOptions, categoryOptions, defaultValues } = useMemo(() => {
    const accountOptions = accounts.map((account) => ({
      label: account.name,
      id: `${account.id}`,
    }));
    const categoryOptions = categories.map((category) => ({
      label: category.name,
      id: `${category.id}`,
    }));
    const account = transaction
      ? accountOptions.find(
          (option) => `${transaction.accountId}` === option.id,
        )
      : accountOptions[0] || null;
    const category = transaction
      ? categoryOptions.find(
          (option) => `${transaction.categoryId}` === option.id,
        )
      : null;
    return {
      accountOptions,
      categoryOptions,
      defaultValues: {
        amount: transaction?.amount.toString(),
        date: transaction?.date
          ? createUTCDate(transaction.date)
          : startOfToday(),
        description: transaction?.description || '',
        account,
        type: transaction?.type || 'Expense',
        category,
      },
    };
  }, [accounts, categories, transaction]);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TransactionFormValues>({
    mode: 'onBlur',
    defaultValues,
  });
  const onSubmit: SubmitHandler<TransactionFormValues> = useCallback(
    async (values) => {
      const common = {
        date: createUTCDate(values.date!),
        categoryId: values.category?.id
          ? parseInt(values.category.id, 10)
          : null,
        amount: parseFloat(values.amount),
        accountId: parseInt(values.account.id, 10),
      };
      if (transaction) {
        await onUpdate({
          id: transaction.id,
          ...values,
          ...common,
        });
      } else {
        await onCreate({
          ...values,
          ...common,
        });
      }
      onClose();
    },
    [onCreate, onUpdate, onClose, transaction],
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
        <DialogTitle id={`${id}-title`}>
          {transaction ? 'Edit transaction' : 'Create transaction'}
        </DialogTitle>
        <DialogContent>
          <Stack paddingY={1} gap={1.5}>
            <TextField
              required
              type="number"
              label="Amount"
              error={!!errors.amount}
              inputProps={{
                step: 0.01,
              }}
              {...register('amount', { required: true })}
            />
            <Controller
              control={control}
              name="date"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  label="Date"
                  value={value}
                  onChange={(value) => onChange(value)}
                />
              )}
            />
            <TextField
              label="Description"
              error={!!errors.description}
              {...register('description')}
            />
            {!transaction && (
              <Controller
                control={control}
                name="account"
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Autocomplete
                    disableClearable
                    id="account-autocomplete"
                    value={value}
                    onChange={(_event, newValue) => onChange(newValue!)}
                    options={accountOptions}
                    isOptionEqualToValue={isOptionEqualToValue}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Account"
                        required
                        error={!!errors.account}
                      />
                    )}
                    onBlur={onBlur}
                  />
                )}
              />
            )}
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <TransactionTypeSelect value={value} onChange={onChange} />
              )}
            />
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange, onBlur } }) => (
                <Autocomplete
                  id="category-autocomplete"
                  value={value}
                  onChange={(_event, newValue) => onChange(newValue!)}
                  options={categoryOptions}
                  isOptionEqualToValue={isOptionEqualToValue}
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
