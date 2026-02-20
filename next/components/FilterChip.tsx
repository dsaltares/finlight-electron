import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Props = {
  label: string;
  color?: string;
  onRemove: () => void;
};

export default function FilterChip({ label, color, onRemove }: Props) {
  return (
    <Badge
      variant="outline"
      className="gap-1 pr-1"
      style={
        color
          ? {
              backgroundColor: color,
              color: 'white',
              borderColor: 'transparent',
            }
          : undefined
      }
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex items-center hover:opacity-70"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
