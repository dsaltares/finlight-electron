'use client';

import { Landmark, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import flags from '@/lib/flags';
import { formatAmount } from '@/lib/format';
import type { RouterOutput } from '@/lib/trpc';

type Account = RouterOutput['accounts']['list']['accounts'][number];

type Props = {
  account: Account;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function AccountListItem({
  account,
  onUpdate,
  onDelete,
}: Props) {
  const flagSrc = flags[account.currency.toLowerCase() as keyof typeof flags];

  return (
    <Card className="flex-row items-center border border-border py-0 ring-0">
      <CardContent className="flex min-w-0 flex-1 items-center gap-3 py-2">
        <Avatar>
          {flagSrc ? (
            <AvatarImage src={flagSrc} alt={account.currency} />
          ) : null}
          <AvatarFallback>
            <Landmark className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <CardTitle className="truncate">{account.name}</CardTitle>
          <CardDescription
            className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}
          >
            {formatAmount(account.balance, account.currency)}
          </CardDescription>
        </div>
      </CardContent>

      <CardAction className="ml-auto flex shrink-0 items-center gap-1 self-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdate(account.id)}
          aria-label={`Edit account ${account.name}`}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(account.id)}
          aria-label={`Delete account ${account.name}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardAction>
    </Card>
  );
}
