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
    <div className="flex flex-col items-center gap-1 p-6">
      <span className="text-muted-foreground">
        <Icon className="size-[42px]" />
      </span>
      <p className="text-center">{children}</p>
    </div>
  );
}
