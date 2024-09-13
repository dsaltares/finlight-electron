import { convertAmount, getRates } from '@server/reports/utils';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { GetAccountsInput, GetAccountsOutput } from './types';

const getAccounts: Procedure<
  GetAccountsInput,
  GetAccountsOutput
> = async () => {
  const accounts = await db
    .selectFrom('bankAccount')
    .selectAll()
    .where('deletedAt', 'is', null)
    .orderBy('createdAt', 'asc')
    .execute();
  const rates = await getRates(
    Array.from(new Set(accounts.map(({ currency }) => currency))),
  );
  return {
    accounts,
    total: {
      value: accounts.reduce(
        (acc, account) =>
          acc + convertAmount(account.balance, account.currency, 'EUR', rates),
        0,
      ),
      currency: 'EUR',
    },
  };
};

export default procedure
  .input(GetAccountsInput)
  .output(GetAccountsOutput)
  .query(getAccounts);
