import { isWeekend } from 'date-fns/isWeekend';
import { startOfYesterday } from 'date-fns/startOfYesterday';
import { subDays } from 'date-fns/subDays';
import createUTCDate from '@lib/createUTCDate';
import getPolygonRates from '@lib/getPolygonRates';
import createDb from '@server/db/createDb';
import { migrateToLatest } from '@server/db/migrations';

const DemoDatabasePath = './finlight-demo.sqlite';
const db = createDb(DemoDatabasePath);

void main();

async function main() {
  await migrateToLatest(DemoDatabasePath);
  await addExchangeRates();
  const csvPresets = await createCsvImportPresets();
  const accounts = await createAccounts(csvPresets);
  const categories = await createCategories();
  await createTransactions(accounts, categories);
  await updateBalances(accounts);
}

function getLastWeekday() {
  let date = startOfYesterday();
  while (isWeekend(date)) {
    date = subDays(date, 1);
  }
  return date;
}

async function addExchangeRates() {
  const date = getLastWeekday();
  const rates = await getPolygonRates({
    date,
    apiKey: process.env.POLYGON_API_KEY!,
  });

  await db.transaction().execute(async (trx) => {
    for (const rate of rates) {
      const { ticker, date, ...rest } = rate;
      await trx
        .insertInto('exchangeRate')
        .values({
          ...rest,
          ticker,
          date: date.toISOString(),
        })
        .onConflict((oc) =>
          oc.column('ticker').doUpdateSet({
            ...rest,
            date: date.toISOString(),
          }),
        )
        .execute();
    }
  });
}

async function createCsvImportPresets() {
  const revolutPreset = await db
    .insertInto('csvImportPreset')
    .values({
      name: 'Revolut',
      fields: JSON.stringify([
        'Ignore',
        'Ignore',
        'Date',
        'Ignore',
        'Description',
        'Amount',
        'Fee',
        'Ignore',
        'Ignore',
        'Ignore',
      ]),
      dateFormat: 'yyyy-MM-dd HH:mm:ss',
      delimiter: ',',
      decimal: '.',
      rowsToSkipStart: 1,
      rowsToSkipEnd: 0,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
  const btPreset = await db
    .insertInto('csvImportPreset')
    .values({
      name: 'Banca Transilvania',
      fields: JSON.stringify([
        'Date',
        'Ignore',
        'Description',
        'Ignore',
        'Withdrawal',
        'Deposit',
      ]),
      dateFormat: 'yyyy-MM-dd',
      delimiter: ',',
      decimal: '.',
      rowsToSkipStart: 17,
      rowsToSkipEnd: 2,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();

  return {
    revolut: revolutPreset.id,
    bt: btPreset.id,
  };
}

async function createAccounts(presets: CSVPresets) {
  const revolutEUR = await db
    .insertInto('bankAccount')
    .values({
      name: 'Revolut EUR',
      currency: 'EUR',
      initialBalance: 1500,
      balance: 1500,
      csvImportPresetId: presets.revolut,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();

  const revolutGBP = await db
    .insertInto('bankAccount')
    .values({
      name: 'Revolut GBP',
      currency: 'GBP',
      initialBalance: 0,
      balance: 0,
      csvImportPresetId: presets.revolut,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();

  const btEUR = await db
    .insertInto('bankAccount')
    .values({
      name: 'Banca Transilvania EUR',
      currency: 'EUR',
      initialBalance: 750,
      balance: 750,
      csvImportPresetId: presets.bt,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();

  const btRON = await db
    .insertInto('bankAccount')
    .values({
      name: 'Banca Transilvania RON',
      currency: 'RON',
      initialBalance: 4500,
      balance: 4500,
      csvImportPresetId: presets.bt,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();

  const xtb = await db
    .insertInto('bankAccount')
    .values({
      name: 'XTB',
      currency: 'EUR',
      initialBalance: 0,
      balance: 0,
      csvImportPresetId: presets.bt,
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();

  return {
    revolutEUR: revolutEUR.id,
    revolutGBP: revolutGBP.id,
    btEUR: btEUR.id,
    btRON: btRON.id,
    xtb: xtb.id,
  };
}

async function createCategories() {
  const groceries = await db
    .insertInto('category')
    .values({
      name: 'Groceries',
      importPatterns: JSON.stringify([]),
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
  const healthcare = await db
    .insertInto('category')
    .values({
      name: 'Healthcare',
      importPatterns: JSON.stringify([]),
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
  const home = await db
    .insertInto('category')
    .values({
      name: 'Home',
      importPatterns: JSON.stringify([]),
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
  const diningOut = await db
    .insertInto('category')
    .values({
      name: 'Dining out',
      importPatterns: JSON.stringify([]),
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
  const leisure = await db
    .insertInto('category')
    .values({
      name: 'Leisure',
      importPatterns: JSON.stringify([]),
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
  const transportation = await db
    .insertInto('category')
    .values({
      name: 'Transportation',
      importPatterns: JSON.stringify([]),
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
  const job = await db
    .insertInto('category')
    .values({
      name: 'Job',
      importPatterns: JSON.stringify([]),
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();
  const investments = await db
    .insertInto('category')
    .values({
      name: 'Investments',
      importPatterns: JSON.stringify([]),
    })
    .returning(['id'])
    .executeTakeFirstOrThrow();

  return {
    groceries: groceries.id,
    home: home.id,
    diningOut: diningOut.id,
    leisure: leisure.id,
    transportation: transportation.id,
    job: job.id,
    investments: investments.id,
    healthcare: healthcare.id,
  };
}

async function createTransactions(accounts: Accounts, categories: Categories) {
  await db
    .insertInto('accountTransaction')
    .values([
      {
        date: createUTCDate('2024-08-01').toISOString(),
        type: 'Income',
        accountId: accounts.btEUR,
        categoryId: categories.job,
        amount: 3466.66,
        description: 'Salary',
      },
      {
        date: createUTCDate('2021-01-03').toISOString(),
        type: 'Transfer',
        accountId: accounts.btEUR,
        amount: -1000,
        description: 'Transfer to Revolut',
      },
      {
        date: createUTCDate('2021-01-03').toISOString(),
        type: 'Transfer',
        accountId: accounts.btEUR,
        amount: -1000,
        description: 'FX EUR RON',
      },
      {
        date: createUTCDate('2021-01-03').toISOString(),
        type: 'Transfer',
        accountId: accounts.btRON,
        amount: 4974.77,
        description: 'FX EUR RON',
      },
      {
        date: createUTCDate('2021-01-04').toISOString(),
        type: 'Transfer',
        accountId: accounts.revolutEUR,
        amount: 1000,
        description: 'Transfer to Revolut',
      },
      {
        date: createUTCDate('2021-01-04').toISOString(),
        type: 'Transfer',
        accountId: accounts.revolutEUR,
        amount: -750,
        description: 'FX EUR GBP',
      },
      {
        date: createUTCDate('2021-01-04').toISOString(),
        type: 'Transfer',
        accountId: accounts.revolutGBP,
        amount: 627.02,
        description: 'FX EUR GBP',
      },
      {
        date: createUTCDate('2024-08-04').toISOString(),
        type: 'Transfer',
        accountId: accounts.btEUR,
        amount: -50,
        description: 'Investment top up',
      },
      {
        date: createUTCDate('2024-08-05').toISOString(),
        type: 'Transfer',
        accountId: accounts.xtb,
        amount: 50,
        description: 'Investment top up',
      },
      {
        date: createUTCDate('2024-08-06').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.home,
        amount: -3400,
        description: 'Rent',
      },
      {
        date: createUTCDate('2024-08-16').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.home,
        amount: -85.76,
        description: 'Electricity bill',
      },
      {
        date: createUTCDate('2024-08-18').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.home,
        amount: -75.43,
        description: 'DIGI fiber',
      },
      {
        date: createUTCDate('2024-08-07').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.groceries,
        amount: -350.67,
        description: 'Lidl',
      },
      {
        date: createUTCDate('2024-08-25').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.groceries,
        amount: -553.45,
        description: 'Kaufland',
      },
      {
        date: createUTCDate('2024-08-28').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.healthcare,
        amount: -99.9,
        description: 'Health insurance',
      },
      {
        date: createUTCDate('2024-08-13').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.healthcare,
        amount: -25.18,
        description: 'Pharmacy',
      },
      {
        date: createUTCDate('2024-08-02').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.diningOut,
        amount: -20,
        description: 'Coffee experts',
      },
      {
        date: createUTCDate('2024-08-07').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.diningOut,
        amount: -230,
        description: 'Steak house',
      },
      {
        date: createUTCDate('2024-08-15').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.diningOut,
        amount: -340,
        description: 'Anniversary dinner',
      },
      {
        date: createUTCDate('2024-08-12').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.diningOut,
        amount: -80,
        description: 'Gyros',
      },
      {
        date: createUTCDate('2024-08-19').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.diningOut,
        amount: -48.18,
        description: 'McDonalds',
      },
      {
        date: createUTCDate('2024-08-29').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.diningOut,
        amount: -85.68,
        description: 'Brewhouse',
      },
      {
        date: createUTCDate('2024-08-20').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.transportation,
        amount: -250.68,
        description: 'Petrol',
      },
      {
        date: createUTCDate('2024-08-20').toISOString(),
        type: 'Income',
        accountId: accounts.xtb,
        categoryId: categories.investments,
        amount: 4.56,
        description: 'XTB update',
      },
      {
        date: createUTCDate('2024-08-03').toISOString(),
        type: 'Expense',
        accountId: accounts.btEUR,
        categoryId: categories.leisure,
        amount: -20,
        description: 'Spotify',
      },
      {
        date: createUTCDate('2024-08-16').toISOString(),
        type: 'Expense',
        accountId: accounts.btEUR,
        categoryId: categories.leisure,
        amount: -16.9,
        description: 'Netflix',
      },
      {
        date: createUTCDate('2024-08-24').toISOString(),
        type: 'Expense',
        accountId: accounts.btEUR,
        categoryId: categories.leisure,
        amount: -66.6,
        description: 'Battle Beast concert',
      },
      {
        date: createUTCDate('2024-08-24').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.leisure,
        amount: -650.0,
        description: 'Clothes',
      },
      {
        date: createUTCDate('2024-08-27').toISOString(),
        type: 'Expense',
        accountId: accounts.btRON,
        categoryId: categories.leisure,
        amount: -120,
        description: 'Gym',
      },
    ])
    .execute();
}

async function updateBalances(accounts: Accounts) {
  for (const accountId of Object.values(accounts)) {
    await updateAccountBalance(accountId);
  }
}

async function updateAccountBalance(accountId: number) {
  const account = await db
    .selectFrom('bankAccount')
    .select('initialBalance')
    .where('id', '=', accountId)
    .executeTakeFirstOrThrow();
  const transactions = await db
    .selectFrom('accountTransaction')
    .select('amount')
    .where('accountId', '=', accountId)
    .where('deletedAt', 'is', null)
    .execute();
  return db
    .updateTable('bankAccount')
    .set({
      balance:
        Math.round(
          transactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            account.initialBalance,
          ) * 100,
        ) / 100,
    })
    .where('id', '=', accountId)
    .returningAll()
    .executeTakeFirstOrThrow();
}

type CSVPresets = Awaited<ReturnType<typeof createCsvImportPresets>>;
type Accounts = Awaited<ReturnType<typeof createAccounts>>;
type Categories = Awaited<ReturnType<typeof createCategories>>;
