import { convertAmount, getRates } from '@server/reports/utils';
import { type Procedure, procedure } from '@server/trpc';
import db from '@server/db';
import { getUserSettings } from '@server/userSettings/store';
import DefaultCurrency from '@lib/defaultCurrency';
import { GetAccountsInput, GetAccountsOutput } from './types';

const getAccounts: Procedure<
  GetAccountsInput,
  GetAccountsOutput
> = async () => {
  const settings = getUserSettings();
  const baseCurrency = settings.currency || DefaultCurrency;
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
          acc +
          convertAmount(account.balance, account.currency, baseCurrency, rates),
        0,
      ),
      currency: baseCurrency,
    },
  };
};

export default procedure
  .input(GetAccountsInput)
  .output(GetAccountsOutput)
  .query(getAccounts);
