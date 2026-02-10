'use client';

import {
  Controller,
  type SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import ImportFields from '@/components/ImportFields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { RouterInput, RouterOutput } from '@/lib/trpc';
import ImportPreview from './ImportPreview';
import type { CSVImportPresetFormValues } from './types';

type BaseProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
};

type CreateProps = {
  onCreate: (input: RouterInput['importPresets']['create']) => Promise<unknown>;
  preset?: never;
  onUpdate?: never;
};

type EditProps = {
  preset: RouterOutput['importPresets']['list'][number];
  onUpdate: (input: RouterInput['importPresets']['update']) => Promise<unknown>;
  onCreate?: never;
};

type Props = BaseProps & (CreateProps | EditProps);

const id = 'create-update-csv-import-preset-dialog';

const dateFormats = [
  'dd MM yy',
  'dd,MM,yy',
  'dd-MM-yy',
  'dd.MM.yy',
  "dd/MM'yy",
  'dd/MM/yy',
  'dd MM yyyy',
  'dd,MM,yyyy',
  'dd-MM-yyyy',
  'dd.MM.yyyy',
  "dd/MM'yyyy",
  'dd/MM/yyyy',
  'dd MMM yy',
  'dd-MMM-yy',
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'yyyy-MM-dd HH:mm:ss',
];

export default function CreateUpdateCSVImportPresetDialog({
  open,
  loading,
  preset,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
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
      fields:
        preset?.fields.map((field) => ({ id: field, value: field })) ?? [],
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

  const onSubmit: SubmitHandler<CSVImportPresetFormValues> = async (values) => {
    const rowsToSkipStart = Number.parseInt(values.rowsToSkipStart, 10);
    const rowsToSkipEnd = Number.parseInt(values.rowsToSkipEnd, 10);
    const importFields = values.fields.map((field) => field.value);
    if (preset) {
      await onUpdate({
        ...preset,
        ...values,
        rowsToSkipStart,
        rowsToSkipEnd,
        fields: importFields,
      });
    } else {
      await onCreate({
        ...values,
        rowsToSkipStart,
        rowsToSkipEnd,
        fields: importFields,
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
      <DialogContent
        id={id}
        aria-labelledby={`${id}-title`}
        className="h-[calc(100dvh-2rem)] overflow-hidden max-w-[calc(100dvw-2rem)] sm:max-w-[calc(100dvw-2rem)]"
      >
        <form
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
          className="flex h-full min-h-0 min-w-0 flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle id={`${id}-title`}>
              {preset ? 'Edit import preset' : 'Create import preset'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name', { required: true })} />
              {errors.name ? (
                <p className="text-xs text-destructive">Name is required.</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="decimal">Decimal character</Label>
                <Input
                  id="decimal"
                  {...register('decimal', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="delimiter">CSV delimiter</Label>
                <Input
                  id="delimiter"
                  {...register('delimiter', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="rowsToSkipStart">Skip rows start</Label>
                <Input
                  id="rowsToSkipStart"
                  type="number"
                  step={1}
                  {...register('rowsToSkipStart', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="rowsToSkipEnd">Skip rows end</Label>
                <Input
                  id="rowsToSkipEnd"
                  type="number"
                  step={1}
                  {...register('rowsToSkipEnd', { required: true })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="dateFormat">Date format</Label>
              <Controller
                control={control}
                name="dateFormat"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="dateFormat"
                    list="date-format-options"
                    placeholder="yyyy-MM-dd"
                  />
                )}
              />
              <datalist id="date-format-options">
                {dateFormats.map((dateFormat) => (
                  <option key={dateFormat} value={dateFormat} />
                ))}
              </datalist>
            </div>

            <ImportFields
              fields={fields.map((field) => field.value)}
              onAppend={(value) => appendItem({ id: value, value })}
              onRemove={removeItem}
              onMove={moveItem}
            />

            <ImportPreview watch={watch} />
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
