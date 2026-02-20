'use client';

import type { MouseEvent } from 'react';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { serializeTransactionFilters } from '@/hooks/useTransactionFilters';
import type { TransactionType } from '@/server/trpc/procedures/schema';

type Props = {
  type: TransactionType;
  onClick?: () => void;
};

export const typeConfig: Record<
  TransactionType,
  { icon: typeof ArrowUpRight; className: string }
> = {
  Income: {
    icon: ArrowUpRight,
    className: 'bg-green-600/15 text-green-700 dark:text-green-400',
  },
  Expense: {
    icon: ArrowDownLeft,
    className: 'bg-red-600/15 text-red-700 dark:text-red-400',
  },
  Transfer: {
    icon: ArrowLeftRight,
    className: 'bg-blue-600/15 text-blue-700 dark:text-blue-400',
  },
};

export default function TransactionTypePill({ type, onClick }: Props) {
  const { icon: Icon, className } = typeConfig[type];
  const href = serializeTransactionFilters('/dashboard/transactions', {
    type,
  });

  const handleClick = onClick
    ? (e: MouseEvent) => {
        e.preventDefault();
        onClick();
      }
    : undefined;

  return (
    <Link href={href} onClick={handleClick}>
      <Badge
        variant="secondary"
        className={`cursor-pointer gap-1 ${className}`}
      >
        <Icon className="size-3" />
        {type}
      </Badge>
    </Link>
  );
}
