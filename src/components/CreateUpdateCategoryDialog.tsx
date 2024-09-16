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
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@server/category/types';

type BaseProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
};

type CreateProps = {
  onCreate: (input: CreateCategoryInput) => Promise<unknown>;
  category?: never;
  onUpdate?: never;
};

type EditProps = {
  category: Category;
  onUpdate: (input: UpdateCategoryInput) => Promise<unknown>;
  onCreate?: never;
};

type Props = BaseProps & (CreateProps | EditProps);

const id = 'create-update-category-dialog';

type CategoryFormValues = {
  name: string;
  importPatterns: string[];
};

export default function CreateUpdateCategoryDialog({
  open,
  loading,
  category,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CategoryFormValues>({
    mode: 'onBlur',
    defaultValues: {
      name: category?.name,
      importPatterns: category ? category.importPatterns : [],
    },
  });
  const onSubmit: SubmitHandler<CategoryFormValues> = useCallback(
    async (values) => {
      if (category) {
        await onUpdate({
          id: category.id,
          ...values,
        });
      } else {
        await onCreate(values);
      }
      onClose();
    },
    [onCreate, onUpdate, onClose, category],
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
        <DialogTitle id={`${id}-title`}>
          {category ? 'Edit category' : 'Create category'}
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
              name="importPatterns"
              render={({ field: { value, onChange, onBlur } }) => (
                <Autocomplete
                  id="import-patterns-autocomplete"
                  freeSolo
                  multiple
                  options={[]}
                  value={value}
                  onChange={(_event, value) => {
                    onChange(value || []);
                  }}
                  getOptionLabel={(option) => option.toString()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Keywords"
                      helperText="Automatically categorize transactions on import."
                      error={!!errors.importPatterns}
                    />
                  )}
                  renderTags={(patterns, getTagProps) =>
                    patterns.map((pattern, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={pattern}
                          size="small"
                          {...tagProps}
                        />
                      );
                    })
                  }
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
