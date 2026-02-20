'use client';

import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type MultiSelectItem = {
  id: number;
  label: string;
  color?: string;
};

type Props = {
  items: MultiSelectItem[];
  selected: number[];
  onToggle: (id: number) => void;
  placeholder: string;
  emptyMessage: string;
};

export default function MultiSelectPopover({
  items,
  selected,
  onToggle,
  placeholder,
  emptyMessage,
}: Props) {
  const [open, setOpen] = useState(false);

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? (items.find((i) => i.id === selected[0])?.label ?? placeholder)
        : `${selected.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList className="max-h-72 overflow-y-auto overscroll-contain">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.id}`}
                  keywords={[item.label]}
                  data-checked={selected.includes(item.id) || undefined}
                  onSelect={() => onToggle(item.id)}
                >
                  {item.color ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                  ) : (
                    item.label
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
