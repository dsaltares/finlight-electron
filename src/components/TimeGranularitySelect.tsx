import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { TimeGranularities, type TimeGranularity } from '@server/reports/types';

const id = 'time-granularity-select';

type Props = {
  value: TimeGranularity | '';
  onChange: (value: TimeGranularity | '') => void;
  granularities?: TimeGranularity[];
};

export default function TimeGranularitySelect({
  value,
  onChange,
  granularities = [...TimeGranularities],
}: Props) {
  return (
    <FormControl fullWidth>
      <InputLabel id={`${id}-label`}>Time granularity</InputLabel>
      <Select
        label="Time granularity"
        id={id}
        labelId={`${id}-label`}
        value={value}
        onChange={(e) => onChange(e.target.value as TimeGranularity | '')}
      >
        {granularities.map((granularity) => (
          <MenuItem key={granularity} value={granularity}>
            {granularity}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
