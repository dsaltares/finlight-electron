import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useCallback } from 'react';
import TextField from '@mui/material/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { enqueueSnackbar } from 'notistack';
import client from '@lib/client';
import type { UserSettings } from '@server/userSettings/types';
import { currencyOptionsById } from '@lib/autoCompleteOptions';
import Fab from './Fab';
import CurrencyAutocomplete from './CurrencyAutocomplete';

type Option = { label: string; id: string };
type UserSettingsFormValues = {
  dataPath: string;
  currency: Option;
};

type Props = {
  settings: UserSettings;
};

export default function SettingsForm({ settings }: Props) {
  const { mutate: updateUserSettings } = client.updateUserSettings.useMutation({
    onSuccess: () => {
      enqueueSnackbar({
        message: 'Settings updated.',
        variant: 'success',
      });
    },
    onError: (e) => {
      enqueueSnackbar({
        message: `Failed to update settings. ${e.message}`,
        variant: 'error',
      });
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<UserSettingsFormValues>({
    mode: 'onBlur',
    defaultValues: {
      dataPath: settings.dataPath,
      currency: currencyOptionsById[settings.currency || 'EUR'],
    },
  });
  const onSubmit: SubmitHandler<UserSettingsFormValues> = useCallback(
    async (values) => {
      updateUserSettings({
        ...values,
        currency: values.currency.id,
      });
    },
    [updateUserSettings],
  );
  const { mutate: showOpenDialog } = client.showOpenDialog.useMutation({
    onSuccess: (result) => {
      if (result) {
        setValue('dataPath', result);
      }
    },
  });
  const handleOpenFileSaveDialog = () => {
    showOpenDialog({
      title: 'Select data location',
      defaultPath: settings.dataPath,
      properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack paddingY={1} gap={1.5}>
        <Stack direction="row" alignItems="center" gap={1}>
          <TextField
            required
            label="Database location"
            error={!!errors.dataPath}
            fullWidth
            {...register('dataPath', { required: true })}
          />
          <IconButton onClick={handleOpenFileSaveDialog}>
            <FolderIcon fontSize="large" />
          </IconButton>
        </Stack>
        <Controller
          control={control}
          name="currency"
          rules={{ required: true }}
          render={({ field: { value, onChange, onBlur } }) => (
            <CurrencyAutocomplete
              label="Preferred currency"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={!!errors.currency}
            />
          )}
        />
      </Stack>
      <Fab type="submit">
        <SaveIcon />
      </Fab>
    </form>
  );
}
