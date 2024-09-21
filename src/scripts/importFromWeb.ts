import SQLite from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import {
  Kysely,
  Migrator,
  ParseJSONResultsPlugin,
  SqliteDialect,
} from 'kysely';
import type { Database } from '@server/db/types';
import ProgrammaticMigrationProvider from '@server/db/migrations/ProgrammaticMigrationProvider';

const prisma = new PrismaClient();
const db = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: new SQLite('./src/scripts/finlight.sqlite'),
  }),
  plugins: [new ParseJSONResultsPlugin()],
  log(event) {
    if (event.level === 'error') {
      console.error(
        `Query failed (Writer) : ${JSON.stringify(
          {
            durationMs: event.queryDurationMillis,
            sql: event.query.sql,
            params: event.query.parameters,
            error: event.error,
          },
          null,
          2,
        )}`,
      );
    }
    // else {
    //   console.log(
    //     `Query executed : ${JSON.stringify(
    //       {
    //         durationMs: event.queryDurationMillis,
    //         sql: event.query.sql,
    //         params: event.query.parameters,
    //         error: event,
    //       },
    //       null,
    //       2,
    //     )}`,
    //   );
    // }
  },
});
const userId = 'cljo54zpr0000lc08v15o6fmx';

void main();

async function main() {
  const startTime = performance.now();

  await migrateToLatest();
  const presetIdMap = await importCsvImportPresets();
  const accountIdMap = await importAccounts(presetIdMap);
  const categoryIdMap = await importCategories();
  await importTransactions(accountIdMap, categoryIdMap);
  const budgetIdMap = await importBudgets();
  await importBudgetEntries(budgetIdMap, categoryIdMap);

  const endTime = performance.now();
  console.log(`Import completed in ${endTime - startTime}ms`);
}

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new ProgrammaticMigrationProvider(),
  });

  const { error, results } = await migrator.migrateToLatest();
  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }
}

async function importCsvImportPresets() {
  console.log('Importing CSV import presets...');
  const presets = await prisma.cSVImportPreset.findMany({
    where: {
      userId,
    },
  });

  console.log(`Found ${presets.length} CSV import presets`);
  const idMap = new Map<string, number>();
  for (const preset of presets) {
    const imported = await db
      .insertInto('csvImportPreset')
      .values({
        name: preset.name,
        fields: JSON.stringify(preset.fields),
        dateFormat: preset.dateFormat,
        delimiter: preset.delimiter,
        decimal: preset.decimal,
        rowsToSkipStart: preset.rowsToSkipStart,
        rowsToSkipEnd: preset.rowsToSkipEnd,
        createdAt: preset.createdAt.toISOString(),
        updatedAt: preset.updatedAt.toISOString(),
        deletedAt: preset.deletedAt?.toISOString(),
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();
    idMap.set(preset.id, imported.id);
  }
  console.log(`Imported ${presets.length} CSV import presets`);

  return idMap;
}

async function importAccounts(presetIdMap: Map<string, number>) {
  console.log('Importing accounts...');
  const accounts = await prisma.bankAccount.findMany({
    where: {
      userId,
    },
  });

  console.log(`Found ${accounts.length} accounts`);
  const idMap = new Map<string, number>();
  for (const account of accounts) {
    const imported = await db
      .insertInto('bankAccount')
      .values({
        name: account.name,
        initialBalance: account.initialBalance,
        balance: account.balance,
        currency: account.currency,
        csvImportPresetId: account.csvImportPresetId
          ? presetIdMap.get(account.csvImportPresetId)
          : null,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
        deletedAt: account.deletedAt?.toISOString(),
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();
    idMap.set(account.id, imported.id);
  }
  console.log(`Imported ${accounts.length} accounts`);

  return idMap;
}

async function importCategories() {
  console.log('Importing categories...');
  const categories = await prisma.category.findMany({
    where: {
      userId,
    },
  });

  console.log(`Found ${categories.length} categories`);
  const idMap = new Map<string, number>();
  for (const category of categories) {
    const imported = await db
      .insertInto('category')
      .values({
        name: category.name,
        importPatterns: JSON.stringify(category.importPatterns),
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
        deletedAt: category.deletedAt?.toISOString(),
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();

    idMap.set(category.id, imported.id);
  }
  console.log(`Imported ${categories.length} categories`);
  return idMap;
}

async function importTransactions(
  accountIdMap: Map<string, number>,
  categoryIdMap: Map<string, number>,
) {
  console.log('Importing transactions...');
  const transactions = await prisma.transaction.findMany({
    where: {
      accountId: {
        in: Array.from(accountIdMap.keys()),
      },
    },
  });

  console.log(`Found ${transactions.length} transactions`);
  for (const transaction of transactions) {
    await db
      .insertInto('accountTransaction')
      .values({
        date: transaction.date.toISOString(),
        amount: transaction.amount,
        description: transaction.description,
        accountId: accountIdMap.get(transaction.accountId)!,
        categoryId: transaction.categoryId
          ? categoryIdMap.get(transaction.categoryId)
          : null,
        type: transaction.type,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        deletedAt: transaction.deletedAt?.toISOString(),
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();
  }
  console.log(`Imported ${transactions.length} transactions`);
}

async function importBudgets() {
  console.log('Importing budgets...');
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
    },
  });

  console.log(`Found ${budgets.length} budgets`);
  const idMap = new Map<string, number>();
  for (const budget of budgets) {
    const imported = await db
      .insertInto('budget')
      .values({
        granularity: budget.granularity,
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString(),
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();

    idMap.set(budget.id, imported.id);
  }

  console.log(`Imported ${budgets.length} budgets`);
  return idMap;
}

async function importBudgetEntries(
  budgetIdMao: Map<string, number>,
  categoryIdMap: Map<string, number>,
) {
  console.log('Importing budget entries...');
  const entries = await prisma.budgetEntry.findMany({
    where: {
      budgetId: {
        in: Array.from(budgetIdMao.keys()),
      },
    },
  });

  console.log(`Found ${entries.length} budget entries`);
  for (const entry of entries) {
    await db
      .insertInto('budgetEntry')
      .values({
        budgetId: budgetIdMao.get(entry.budgetId)!,
        type: entry.type,
        categoryId: categoryIdMap.get(entry.categoryId)!,
        target: entry.target,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();
  }
  console.log(`Imported ${entries.length} budget entries`);
}
