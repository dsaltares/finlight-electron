import { useCallback, useMemo } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import Stack from '@mui/material/Stack';
import { isOptionEqualToValue } from '@lib/autoCompleteOptions';
import type { Category } from '@server/category/types';

type Props = {
  categories: Category[];
  selected: number[];
  onChange: (selected: number[]) => void;
};

const id = 'category-autocomplete';

export default function CategoryAutocomplete({
  categories,
  selected,
  onChange,
}: Props) {
  const categoriesById = useMemo(
    () =>
      categories.reduce<Record<string, Category>>(
        (acc, category) => ({ ...acc, [category.id]: category }),
        {},
      ),
    [categories],
  );
  const value = useMemo(
    () =>
      selected.map((id) => {
        const category = categoriesById[id];
        return {
          id: category.id.toString(),
          label: category.name,
        };
      }),
    [selected, categoriesById],
  );
  const categoryOptions = useMemo(
    () =>
      categories.map(({ id, name }) => ({ id: id.toString(), label: name })),
    [categories],
  );
  const allSelected = selected.length === categories.length;
  const selectAll = useCallback(
    () => onChange(categories.map((category) => category.id)),
    [categories, onChange],
  );
  const deselectAll = useCallback(() => onChange([]), [onChange]);
  return (
    <FormControl fullWidth>
      <Stack direction="row" spacing={1} alignItems="center">
        <Autocomplete
          multiple
          fullWidth
          disableCloseOnSelect
          id={id}
          value={value}
          options={categoryOptions}
          isOptionEqualToValue={isOptionEqualToValue}
          getOptionLabel={(option) => option.label}
          onChange={(_event, newValue) =>
            onChange(newValue.map((option) => Number(option.id)))
          }
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox style={{ marginRight: 8 }} checked={selected} />
                {option.label}
              </li>
            );
          }}
          renderInput={(params) => <TextField {...params} label="Categories" />}
        />
        <div>
          <IconButton onClick={allSelected ? deselectAll : selectAll}>
            {allSelected ? <DeselectIcon /> : <SelectAllIcon />}
          </IconButton>
        </div>
      </Stack>
    </FormControl>
  );
}
