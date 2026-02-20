'use client';

import type { MouseEvent } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { serializeTransactionFilters } from '@/hooks/useTransactionFilters';

type Props = {
  categoryId: number;
  name: string;
  color: string;
  onClick?: () => void;
};

export default function CategoryPill({
  categoryId,
  name,
  color,
  onClick,
}: Props) {
  const href = serializeTransactionFilters('/dashboard/transactions', {
    categories: [categoryId],
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
        className="cursor-pointer border-transparent text-white"
        style={{ backgroundColor: color }}
      >
        {name}
      </Badge>
    </Link>
  );
}
