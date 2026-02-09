import {
  type SubmitHandler,
  useForm,
  useFieldArray,
  Controller,
} from 'react-hook-form';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from '@mui/material/Grid2';
import { useCallback } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import type {
  CSVImportPreset,
  CreateCSVImportPresetInput,
  UpdateCSVImportPresetInput,
} from '@server/csvImportPreset/types';
import ImportFields from '@components/ImportFields';
import type { CSVImportPresetFormValues } from './types';
import ImportPreview from './ImportPreview';

type BaseProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
};

type CreateProps = {
  onCreate: (input: CreateCSVImportPresetInput) => Promise<unknown>;
  preset?: never;
  onUpdate?: never;
};

type EditProps = {
  preset: CSVImportPreset;
  onUpdate: (input: UpdateCSVImportPresetInput) => Promise<unknown>;
  onCreate?: never;
};

type Props = BaseProps & (CreateProps | EditProps);

const id = 'create-update-csvImportPreset-dialog';

const dateFormats = [
  'dd MM yy',
  'dd,MM,yy',
  'dd-MM-yy',
  'dd.MM.yy',
  `dd/MM'yy`,
  'dd/MM/yy',
  'dd MM yyyy',
  'dd,MM,yyyy',
  'dd-MM-yyyy',
  'dd.MM.yyyy',
  `dd/MM'yyyy`,
  'dd/MM/yyyy',
  'dd MMM yy',
  'dd-MMM-yy',
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'yyyy-MM-dd HH:mm:ss',
];

const CreateUpdateCSVImportPresetDialog = ({
  open,
  loading,
  preset,
  onClose,
  onCreate,
  onUpdate,
}: Props) => {
  const {
    watch,
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CSVImportPresetFormValues>({
    mode: 'onBlur',
    defaultValues: {
      name: preset?.name,
      decimal: preset?.decimal ?? '.',
      delimiter: preset?.delimiter ?? ',',
      dateFormat: preset?.dateFormat ?? 'yyyy-MM-dd',
      fields: preset?.fields.map((field) => ({ value: field })) ?? [],
      rowsToSkipStart: (preset?.rowsToSkipStart ?? 0).toString(),
      rowsToSkipEnd: (preset?.rowsToSkipEnd ?? 0).toString(),
    },
  });
  const {
    fields,
    append: appendItem,
    remove: removeItem,
    move: moveItem,
  } = useFieldArray({
    control,
    name: 'fields',
  });

  const onSubmit: SubmitHandler<CSVImportPresetFormValues> = useCallback(
    async (values) => {
      const rowsToSkipStart = parseInt(values.rowsToSkipStart, 10);
      const rowsToSkipEnd = parseInt(values.rowsToSkipEnd, 10);
      const fields = values.fields.map((field) => field.value);
      if (preset) {
        await onUpdate({
          ...preset,
          ...values,
          rowsToSkipStart,
          rowsToSkipEnd,
          fields,
        });
      } else {
        await onCreate({
          ...values,
          rowsToSkipStart,
          rowsToSkipEnd,
          fields,
        });
      }
      onClose();
    },
    [onCreate, onUpdate, onClose, preset],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      id={id}
      aria-labelledby={`${id}-title`}
      fullScreen
      keepMounted={false}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle id={`${id}-title`}>
          {preset ? 'Edit import preset' : 'Create import preset'}
        </DialogTitle>
        <DialogContent>
          <Stack paddingY={1} gap={1.5}>
            <TextField
              required
              label="Name"
              error={!!errors.name}
              {...register('name', { required: true })}
            />
            <Grid container spacing={1}>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  required
                  fullWidth
                  label="Decimal character"
                  error={!!errors.decimal}
                  {...register('decimal', { required: true })}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  required
                  fullWidth
                  label="CSV delimiter"
                  error={!!errors.delimiter}
                  {...register('delimiter', { required: true })}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Skip rows start"
                  error={!!errors.rowsToSkipStart}
                  inputProps={{
                    step: 1,
                  }}
                  {...register('rowsToSkipStart', { required: true })}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Skip rows end"
                  error={!!errors.rowsToSkipEnd}
                  inputProps={{
                    step: 1,
                  }}
                  {...register('rowsToSkipEnd', { required: true })}
                />
              </Grid>
            </Grid>
            <Controller
              control={control}
              name="dateFormat"
              render={({ field: { value, onChange, onBlur } }) => (
                <Autocomplete
                  id="dateFormat-autocomplete"
                  value={value}
                  onChange={(_event, newValue) => onChange(newValue!)}
                  options={dateFormats}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Date format"
                      error={!!errors.dateFormat}
                    />
                  )}
                  onBlur={onBlur}
                />
              )}
            />
            <ImportFields
              fields={fields.map((field) => field.value)}
              onAppend={(value) => appendItem({ id: value, value })}
              onRemove={removeItem}
              onMove={moveItem}
            />
            <ImportPreview watch={watch} />
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

export default CreateUpdateCSVImportPresetDialog;
