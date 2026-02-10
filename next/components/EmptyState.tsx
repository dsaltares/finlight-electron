import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';

type Props = {
  Icon: LucideIcon;
};

export default function EmptyState({
  Icon,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="flex flex-col items-center gap-2 p-6">
      <span className="text-muted-foreground">
        <Icon className="w-12" />
      </span>
      <p className="text-center text-sm">{children}</p>
    </div>
  );
}
