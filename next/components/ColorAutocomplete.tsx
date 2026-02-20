import type { Option } from '@/components/combobox';
import Combobox from '@/components/combobox';
import {
  CategoryColorHexValues,
  CategoryColorsByHex,
} from '@/lib/categoryColors';

const colorOptions: Option[] = CategoryColorHexValues.map((hex) => {
  const color = CategoryColorsByHex[hex];
  return {
    value: color.hex,
    label: `${color.name} (${color.hex})`,
    keywords: [
      color.name,
      color.hex,
      color.name.toLowerCase(),
      color.hex.toLowerCase(),
    ],
  };
});

const colorOptionsByHex = Object.fromEntries(
  colorOptions.map((option) => [option.value, option]),
) as Record<string, Option>;

type Props = {
  value: Option;
  onChange: (value: Option) => void;
  label?: string;
  emptyMessage?: string;
  fullWidth?: boolean;
};

export default function ColorAutocomplete({
  value,
  onChange,
  label = 'Color',
  emptyMessage = 'No colors found.',
  fullWidth = true,
}: Props) {
  return (
    <Combobox
      options={colorOptions}
      value={value.value}
      onChange={(nextValue) => {
        if (!nextValue || nextValue === value.value) {
          return;
        }
        const nextOption = colorOptionsByHex[nextValue];
        if (nextOption) {
          onChange(nextOption);
        }
      }}
      placeholder={label}
      emptyMessage={emptyMessage}
      fullWidth={fullWidth}
      renderOption={(option) => <ColorOptionContent option={option} />}
    />
  );
}

function ColorOptionContent({ option }: { option: Option }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className="size-4 shrink-0 rounded-full border border-border"
        style={{ backgroundColor: option.value }}
      />
      <span className="truncate">{option.label}</span>
    </span>
  );
}
