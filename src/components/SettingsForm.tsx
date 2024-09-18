import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useCallback } from 'react';
import TextField from '@mui/material/TextField';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import client from '@lib/client';
import type { UserSettings } from '@server/userSettings/types';
import Fab from './Fab';

type UserSettingsFormValues = {
  dbPath: string;
};

type Props = {
  settings: UserSettings;
};

export default function SettingsForm({ settings }: Props) {
  const { mutate: updateUserSettings } =
    client.updateUserSettings.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserSettingsFormValues>({
    mode: 'onBlur',
    defaultValues: {
      dbPath: settings.dbPath,
    },
  });
  const onSubmit: SubmitHandler<UserSettingsFormValues> = useCallback(
    async (values) => {
      updateUserSettings(values);
    },
    [updateUserSettings],
  );
  const { mutate: showFileSaveDialog } = client.showFileSaveDialog.useMutation({
    onSuccess: (result) => {
      if (result) {
        setValue('dbPath', result);
      }
    },
  });
  const handleOpenFileSaveDialog = () => {
    showFileSaveDialog({
      title: 'Select database location',
      defaultPath: settings.dbPath,
      filters: [
        {
          name: 'Sqlite',
          extensions: ['sqlite'],
        },
      ],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack paddingY={1} gap={1.5}>
        <Stack direction="row" alignItems="center" gap={1}>
          <TextField
            required
            label="Database location"
            error={!!errors.dbPath}
            fullWidth
            {...register('dbPath', { required: true })}
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
