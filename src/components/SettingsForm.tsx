import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useCallback } from 'react';
import TextField from '@mui/material/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { enqueueSnackbar } from 'notistack';
import client from '@lib/client';
import type { UserSettings } from '@server/userSettings/types';
import Fab from './Fab';

type UserSettingsFormValues = {
  dataPath: string;
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
  } = useForm<UserSettingsFormValues>({
    mode: 'onBlur',
    defaultValues: {
      dataPath: settings.dataPath,
    },
  });
  const onSubmit: SubmitHandler<UserSettingsFormValues> = useCallback(
    async (values) => {
      updateUserSettings(values);
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
      </Stack>
      <Fab type="submit">
        <SaveIcon />
      </Fab>
    </form>
  );
}
