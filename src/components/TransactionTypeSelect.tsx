import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {
  TransactionTypes,
  type TransactionType,
} from '@server/transactions/types';

type Props = {
  value: TransactionType | '';
  onChange: (value: TransactionType) => void;
  disabled?: boolean;
  clearable?: boolean;
};

export default function TransactionTypeSelect({
  value,
  onChange,
  disabled,
  clearable,
}: Props) {
  return (
    <FormControl fullWidth>
      <InputLabel id="transaction-type-select-label" disabled={disabled}>
        Type
      </InputLabel>
      <Select
        labelId="transaction-type-select-label"
        id="demo-simple-select"
        value={value}
        label="Type"
        onChange={(e) => onChange(e.target.value as TransactionType)}
        disabled={disabled}
      >
        {!!clearable && (
          <MenuItem key="empty" value="">
            Any
          </MenuItem>
        )}
        {TransactionTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
