import { useMemo } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { Category } from '@server/category/types';

type Props = {
  categories: Category[];
  selected: number[];
  onChange: (selected: number[]) => void;
};

const id = 'category-select';

export default function CategorySelect({
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
  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`}>Categories</InputLabel>
      <Select
        multiple
        label="Categories"
        id={id}
        labelId={`${id}-label`}
        value={selected}
        onChange={({ target: { value } }) =>
          onChange(
            typeof value === 'string' ? value.split(',').map(Number) : value,
          )
        }
        renderValue={(values) =>
          values.map((value) => categoriesById[value].name).join(', ')
        }
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            <Checkbox checked={selected.indexOf(category.id) > -1} />
            <ListItemText primary={category.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
