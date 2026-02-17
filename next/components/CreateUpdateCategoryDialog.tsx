'use client';

import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import ColorAutocomplete from '@/components/ColorAutocomplete';
import type { Option as ComboboxOption } from '@/components/combobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label as FormLabel } from '@/components/ui/label';
import MultipleSelector, {
  type Option as MultipleSelectorOption,
} from '@/components/ui/multiple-selector';
import { Spinner } from '@/components/ui/spinner';
import {
  CategoryColorsByHex,
  DefaultCategoryColor,
} from '@/lib/categoryColors';
import type { RouterInput } from '@/lib/trpc';
import type { Category } from '@/server/trpc/procedures/categories';

type BaseDialogProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
};

type CreateDialogProps = {
  onCreate: (input: RouterInput['categories']['create']) => Promise<unknown>;
  category?: never;
  onUpdate?: never;
};

type UpdateDialogProps = {
  category: Category;
  onUpdate: (input: RouterInput['categories']['update']) => Promise<unknown>;
  onCreate?: never;
};

type Props = BaseDialogProps & (CreateDialogProps | UpdateDialogProps);

type CategoryFormValues = {
  name: string;
  color: string;
  importPatterns: MultipleSelectorOption[];
};

export default function CreateUpdateCategoryDialog({
  open,
  loading,
  category,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const title = category ? 'Edit category' : 'Create category';
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CategoryFormValues>({
    mode: 'onBlur',
    defaultValues: {
      name: category?.name ?? '',
      color: category?.color ?? DefaultCategoryColor,
      importPatterns:
        category?.importPatterns.map((keyword) => ({
          value: keyword,
          label: keyword,
        })) ?? [],
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: category?.name ?? '',
      color: category?.color ?? DefaultCategoryColor,
      importPatterns:
        category?.importPatterns.map((keyword) => ({
          value: keyword,
          label: keyword,
        })) ?? [],
    });
  }, [open, category, reset]);

  const onSubmit: SubmitHandler<CategoryFormValues> = async (values) => {
    const nextName = values.name.trim();
    const importPatterns = values.importPatterns
      .map((option) => option.value.trim())
      .filter(Boolean);

    if (!nextName) return;

    if (category) {
      await onUpdate({
        id: category.id,
        name: nextName,
        color: values.color,
        importPatterns,
      });
    } else {
      await onCreate({
        name: nextName,
        color: values.color,
        importPatterns,
      });
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent id="create-update-category-dialog">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
        >
          <DialogHeader>
            <h2 className="text-sm font-medium">{title}</h2>
          </DialogHeader>

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor="category-name">Name</FormLabel>
            <Input
              id="category-name"
              {...register('name', { required: true })}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor="category-color">Color</FormLabel>
            <Controller
              control={control}
              name="color"
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => {
                const selectedColor: ComboboxOption =
                  value && CategoryColorsByHex[value]
                    ? {
                        value,
                        label: `${CategoryColorsByHex[value].name} (${value})`,
                      }
                    : {
                        value: DefaultCategoryColor,
                        label: `${CategoryColorsByHex[DefaultCategoryColor].name} (${DefaultCategoryColor})`,
                      };
                return (
                  <div id="category-color">
                    <ColorAutocomplete
                      value={selectedColor}
                      onChange={(nextColor) => onChange(nextColor.value)}
                    />
                  </div>
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor="category-keywords">Keywords</FormLabel>
            <Controller
              control={control}
              name="importPatterns"
              render={({ field: { value, onChange } }) => (
                <MultipleSelector
                  value={value}
                  onChange={onChange}
                  creatable
                  placeholder="Add keywords..."
                  inputProps={{
                    id: 'category-keywords',
                  }}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Type and press enter to create new keywords.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? <Spinner className="mr-1" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
