import LoadingButton from '@mui/lab/LoadingButton';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useMediaQuery from '@mui/material/useMediaQuery';
import { type SubmitHandler, useForm } from 'react-hook-form';
import Stack from '@mui/material/Stack';
import { useCallback, useEffect, useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import type { UpdateKeyValuePairInput } from '@server/keyValue/types';
import { PolygonApiKeySettingName } from '@lib/getPolygonRates';

type Props = {
  open: boolean;
  loading: boolean;
  apiKey?: string;
  onClose: () => void;
  onUpdate: (input: UpdateKeyValuePairInput) => Promise<unknown>;
};

const id = 'exchange-rates-dialog';

type ExchangeRatesFormValues = {
  apiKey: string;
};

export default function ExchangeRatesSettingsDialog({
  open,
  loading,
  apiKey,
  onClose,
  onUpdate,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ExchangeRatesFormValues>({
    mode: 'onBlur',
    defaultValues: {
      apiKey: apiKey || '',
    },
  });
  const onSubmit: SubmitHandler<ExchangeRatesFormValues> = useCallback(
    async (values) => {
      await onUpdate({
        key: PolygonApiKeySettingName,
        value: values.apiKey,
      });
      onClose();
    },
    [onUpdate, onClose],
  );

  const [showApiKey, setShowApiKey] = useState(false);
  const handleClickShowPassword = () => setShowApiKey((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };
  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };
  useEffect(() => {
    if (open) {
      setShowApiKey(false);
    }
  }, [setShowApiKey, open]);

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
        <DialogTitle id={`${id}-title`}>Exchange rates settings</DialogTitle>
        <DialogContent>
          <Stack paddingY={1} gap={1.5}>
            <TextField
              required
              label="Polygon.io API key"
              error={!!errors.apiKey}
              {...register('apiKey', { required: true })}
              slotProps={{
                input: {
                  type: showApiKey ? 'text' : 'password',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle api key visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                      >
                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
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
