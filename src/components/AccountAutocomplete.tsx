import { useCallback, useMemo } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import type { Account } from '@server/accounts/types';
import { isOptionEqualToValue } from '@lib/autoCompleteOptions';

type Props = {
  accounts: Account[];
  selected: number[];
  onChange: (selected: number[]) => void;
};

const id = 'account-autocomplete';

export default function AccountAutocomplete({
  accounts,
  selected,
  onChange,
}: Props) {
  const accountsById = useMemo(
    () =>
      accounts.reduce<Record<string, Account>>(
        (acc, account) => ({ ...acc, [account.id]: account }),
        {},
      ),
    [accounts],
  );
  const value = useMemo(
    () =>
      selected.map((id) => {
        const category = accountsById[id];
        return {
          id: category.id.toString(),
          label: category.name,
        };
      }),
    [selected, accountsById],
  );
  const accountOptions = useMemo(
    () => accounts.map(({ id, name }) => ({ id: id.toString(), label: name })),
    [accounts],
  );
  const allSelected = selected.length === accounts.length;
  const selectAll = useCallback(
    () => onChange(accounts.map((account) => account.id)),
    [accounts, onChange],
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
          options={accountOptions}
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
          renderInput={(params) => <TextField {...params} label="Accounts" />}
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
