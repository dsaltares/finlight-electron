import { code } from 'currency-codes';
import Image from 'next/image';
import type { Option } from '@/components/combobox';
import Combobox from '@/components/combobox';
import flags from '@/lib/flags';

export const currencyOptions: Option[] = Object.keys(flags)
  .map((currency) => ({
    value: currency.toUpperCase(),
    label: code(currency.toUpperCase())?.currency as string | undefined,
  }))
  .filter((option): option is Option => Boolean(option.label))
  .map(({ value, label }) => ({ value, label: `${value} - ${label}` }));

export const currencyOptionsById = Object.fromEntries(
  currencyOptions.map((option) => [option.value, option]),
) as Record<string, Option>;

type Props = {
  value: Option;
  onChange: (value: Option) => void;
  label?: string;
  emptyMessage?: string;
  fullWidth?: boolean;
};

export default function CurrencyAutocomplete({
  value,
  onChange,
  label = 'Currency',
  emptyMessage = 'No currencies found.',
  fullWidth = true,
}: Props) {
  return (
    <Combobox
      options={currencyOptions}
      value={value.value}
      onChange={(nextValue) => {
        if (!nextValue || nextValue === value.value) {
          return;
        }
        const nextOption = currencyOptionsById[nextValue];
        if (nextOption) {
          onChange(nextOption);
        }
      }}
      placeholder={label}
      emptyMessage={emptyMessage}
      fullWidth={fullWidth}
      renderOption={(option) => <CurrencyOptionContent option={option} />}
    />
  );
}

function CurrencyOptionContent({ option }: { option: Option }) {
  const flagSrc = flags[option.value.toLowerCase() as keyof typeof flags];
  return (
    <span className="flex items-center gap-2">
      {flagSrc ? (
        <Image
          src={flagSrc}
          alt=""
          className="size-5 shrink-0 rounded-full object-cover"
          width={20}
          height={20}
          unoptimized
        />
      ) : null}
      <span className="truncate">{option.label}</span>
    </span>
  );
}
