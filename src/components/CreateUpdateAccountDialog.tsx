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
import Autocomplete from '@mui/material/Autocomplete';
import {
  currencyOptionsById,
  isOptionEqualToValue,
  getOptionLabel,
} from '@lib/autoCompleteOptions';
import type { CSVImportPreset } from '@server/csvImportPreset/types';
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from '@server/accounts/types';
import CurrencyAutocomplete from './CurrencyAutocomplete';

type BaseProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  presets: CSVImportPreset[];
};

type CreateProps = {
  onCreate: (input: CreateAccountInput) => Promise<unknown>;
  account?: never;
  onUpdate?: never;
};

type EditProps = {
  account: Account;
  onUpdate: (input: UpdateAccountInput) => Promise<unknown>;
  onCreate?: never;
};

type Props = BaseProps & (CreateProps | EditProps);

const id = 'create-update-account-dialog';

type Option = { label: string; id: string };
type AccountFormValues = {
  name: string;
  initialBalance: string;
  currency: Option;
  csvImportPreset?: Option | null;
};

const CreateUpdateAccountDialog = ({
  open,
  loading,
  account,
  presets,
  onClose,
  onCreate,
  onUpdate,
}: Props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { presetOptions, csvImportPreset } = useMemo(() => {
    const presetOptions = presets.map(({ id, name }) => ({
      id: `${id}`,
      label: name,
    }));
    const csvImportPreset = account
      ? presetOptions.find(
          (option) => option.id === `${account.csvImportPresetId}`,
        ) || null
      : null;
    return { presetOptions, csvImportPreset };
  }, [presets, account]);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AccountFormValues>({
    mode: 'onBlur',
    defaultValues: {
      name: account?.name,
      currency: currencyOptionsById[account?.currency || 'EUR'],
      initialBalance: (account?.initialBalance || 0).toString(),
      csvImportPreset,
    },
  });
  const onSubmit: SubmitHandler<AccountFormValues> = useCallback(
    async (values) => {
      if (account) {
        await onUpdate({
          ...account,
          ...values,
          currency: values.currency.id,
          csvImportPresetId: values.csvImportPreset?.id
            ? parseInt(values.csvImportPreset?.id, 10)
            : null,
          initialBalance: parseFloat(values.initialBalance),
        });
      } else {
        await onCreate({
          ...values,
          currency: values.currency.id,
          csvImportPresetId: values.csvImportPreset?.id
            ? parseInt(values.csvImportPreset?.id, 10)
            : null,
          initialBalance: parseFloat(values.initialBalance),
        });
      }
      onClose();
    },
    [onCreate, onUpdate, onClose, account],
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
          {account ? 'Edit account' : 'Create account'}
        </DialogTitle>
        <DialogContent>
          <Stack paddingY={1} gap={1.5}>
            <TextField
              required
              label="Name"
              error={!!errors.name}
              {...register('name', { required: true })}
            />
            <Controller
              control={control}
              name="currency"
              rules={{ required: true }}
              render={({ field: { value, onChange, onBlur } }) => (
                <CurrencyAutocomplete
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={!!errors.currency}
                />
              )}
            />
            <TextField
              required
              type="number"
              label="Initial balance"
              error={!!errors.initialBalance}
              inputProps={{
                step: 0.01,
              }}
              {...register('initialBalance', { required: true })}
            />
            <Controller
              control={control}
              name="csvImportPreset"
              render={({ field: { value, onChange, onBlur } }) => (
                <Autocomplete
                  id="csv-import-preset-autocomplete"
                  value={value}
                  onChange={(_event, newValue) => onChange(newValue!)}
                  options={presetOptions}
                  isOptionEqualToValue={isOptionEqualToValue}
                  getOptionLabel={getOptionLabel}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Import preset"
                      error={!!errors.csvImportPreset}
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
};

export default CreateUpdateAccountDialog;
