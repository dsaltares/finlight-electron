'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import Combobox, { type Option } from '@/components/combobox';
import { type RouterOutput, useTRPC } from '@/lib/trpc';

type Category = RouterOutput['categories']['list'][number];

type Props = {
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
};

export default function CategoryAutocomplete({
  value,
  onChange,
  fullWidth = true,
}: Props) {
  const trpc = useTRPC();
  const { data: categories } = useQuery(trpc.categories.list.queryOptions());

  const options = useMemo(
    () =>
      (categories ?? []).map((category) => ({
        label: category.name,
        value: `${category.id}`,
        keywords: [category.name],
      })),
    [categories],
  );

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Select category..."
      emptyMessage="No categories found."
      fullWidth={fullWidth}
      renderOption={(option) => (
        <CategoryOptionContent option={option} categories={categories ?? []} />
      )}
    />
  );
}

function CategoryOptionContent({
  option,
  categories,
}: {
  option: Option;
  categories: Category[];
}) {
  const category = categories.find((c) => `${c.id}` === option.value);
  return (
    <span className="flex items-center gap-2">
      <span
        className="size-3 shrink-0 rounded-full border border-border"
        style={{ backgroundColor: category?.color ?? 'transparent' }}
      />
      <span className="truncate">{option.label}</span>
    </span>
  );
}
