import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { type Period, PeriodLabels } from '@server/types';

type Props = {
  id: string;
  label: string;
  value: Period | '';
  onChange: (value: Period | '') => void;
};

export default function PeriodSelect({ id, label, value, onChange }: Props) {
  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        label="Period"
        id={id}
        labelId={`${id}-label`}
        value={value}
        onChange={(e) => onChange(e.target.value as Period | '')}
      >
        {Object.entries(PeriodLabels).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
