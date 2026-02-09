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
import { useCallback } from 'react';
import { enqueueSnackbar } from 'notistack';
import DialogContentText from '@mui/material/DialogContentText';
import { currencyOptionsById } from '@lib/autoCompleteOptions';
import { formatNumber } from '@lib/format';
import client from '@lib/client';
import CurrencyAutocomplete from './CurrencyAutocomplete';

type Props = {
  open: boolean;
  onClose: () => void;
};

const id = 'create-exchangerate-dialog';

type Option = { label: string; id: string };
type ExchgangeRateFormValues = {
  currency: Option;
  close: string;
};

export default function CreateExchangeRateDialog({ open, onClose }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ExchgangeRateFormValues>({
    mode: 'onBlur',
    defaultValues: {
      currency: currencyOptionsById['USD'],
      close: formatNumber(1.0),
    },
  });
  const { mutate: createExchangeRate, isPending: isCreating } =
    client.createExchangeRate.useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          message: 'Exchange rate created.',
          variant: 'success',
        });
        onClose();
      },
      onError: (e) => {
        enqueueSnackbar({
          message: `Failed to create exchange rate. ${e.message}`,
          variant: 'error',
        });
      },
    });
  const onSubmit: SubmitHandler<ExchgangeRateFormValues> = useCallback(
    async (values) =>
      createExchangeRate({
        ticker: `EUR${values.currency.id}`,
        close: parseFloat(values.close),
      }),
    [createExchangeRate],
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
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle id={`${id}-title`}>Edit exchange rate</DialogTitle>
        <DialogContent>
          <Stack gap={4}>
            <DialogContentText fontStyle="italic" fontSize="sm">
              🇪🇺 EUR is always the base currecy
            </DialogContentText>
            <Stack direction="row" alignItems="center" gap={1}>
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
                fullWidth
                required
                type="number"
                label="Rate"
                error={!!errors.close}
                inputProps={{
                  step: 0.0001,
                  min: 0.0001,
                }}
                {...register('close', { required: true })}
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
            loading={isCreating}
            disabled={!isValid}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
