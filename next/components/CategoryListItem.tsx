'use client';

import { Pencil, Tag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { serializeTransactionFilters } from '@/hooks/useTransactionFilters';
import getContrastingTextColor from '@/lib/getContastingTextColor';
import type { RouterOutput } from '@/lib/trpc';

type Category = RouterOutput['categories']['list'][number];

type Props = {
  category: Category;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function CategoryListItem({
  category,
  onUpdate,
  onDelete,
}: Props) {
  const keywordCount = category.importPatterns.length;
  const iconColor = getContrastingTextColor(category.color);
  const href = serializeTransactionFilters('/dashboard/transactions', {
    categories: [category.id],
    period: 'lastMonth',
  });

  return (
    <Card className="flex-row items-center border border-border py-0 ring-0">
      <Link href={href} className="flex min-w-0 flex-1">
        <CardContent className="flex min-w-0 flex-1 items-center gap-3 py-2">
          <Avatar>
            <AvatarFallback
              style={{
                backgroundColor: category.color,
                color: iconColor,
              }}
            >
              <Tag className="size-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <CardTitle className="truncate">{category.name}</CardTitle>
            <CardDescription>
              {keywordCount > 0
                ? `${keywordCount} keyword${keywordCount > 1 ? 's' : ''}`
                : 'No keywords'}
            </CardDescription>
          </div>
        </CardContent>
      </Link>

      <CardAction className="ml-auto flex shrink-0 items-center gap-1 self-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdate(category.id)}
          aria-label={`Edit category ${category.name}`}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(category.id)}
          aria-label={`Delete category ${category.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardAction>
    </Card>
  );
}
