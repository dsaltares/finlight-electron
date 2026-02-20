import { ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export type Option = {
  label: string;
  value: string;
  keywords?: string[];
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  fullWidth?: boolean;
  renderOption?: (option: Option) => ReactNode;
};

export default function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  emptyMessage = 'No options found.',
  fullWidth = false,
  renderOption,
}: Props) {
  const [open, setOpen] = useState(false);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const triggerContent = selectedOption
    ? renderOption
      ? renderOption(selectedOption)
      : selectedOption.label
    : placeholder;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', fullWidth ? 'w-full' : 'w-[200px]')}
        >
          <span className="flex flex-1 items-center truncate">
            {triggerContent}
          </span>
          <ChevronsUpDown className="opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-0"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList
            className="max-h-72 overflow-y-auto overscroll-contain"
            onWheelCapture={(event) => {
              event.stopPropagation();
            }}
          >
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={option.keywords}
                  data-checked={value === option.value || undefined}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {renderOption ? renderOption(option) : option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
