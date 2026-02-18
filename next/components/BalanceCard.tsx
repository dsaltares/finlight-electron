'use client';

import { Landmark } from 'lucide-react';
import pluralize from 'pluralize';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatAmount } from '@/lib/format';

type Props = {
  balanceInCents: number;
  currency: string;
  accountsCount: number;
  currenciesCount: number;
};

export default function BalanceCard({
  balanceInCents,
  currency,
  accountsCount,
  currenciesCount,
}: Props) {
  const accountsText = `${accountsCount} ${pluralize('account', accountsCount)}`;
  const currenciesText = `${currenciesCount} ${pluralize('currency', currenciesCount)}`;

  return (
    <Card className="gap-0.5">
      <CardHeader>
        <CardTitle>Total balance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardDescription>
          {`Across ${accountsText} and ${currenciesText}.`}
        </CardDescription>
        <div className="flex items-center gap-2">
          <Landmark
            className={
              balanceInCents >= 0
                ? 'size-5 text-green-600'
                : 'size-5 text-red-600'
            }
          />
          <p
            className={
              balanceInCents >= 0
                ? 'text-lg font-semibold text-green-600'
                : 'text-lg font-semibold text-red-600'
            }
          >
            {formatAmount(balanceInCents, currency)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
