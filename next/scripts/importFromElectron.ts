import fs from 'node:fs/promises';
import path from 'node:path';
import SQLite from 'better-sqlite3';
import { Command } from 'commander';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import { CategoryColorHexValues } from '@/lib/categoryColors';
import { db } from '@/server/db';
import { getLogger } from '@/server/logger';

type SourceTransactionType = 'Income' | 'Expense' | 'Transfer';
type SourceBudgetGranularity = 'Monthly' | 'Quarterly' | 'Yearly';
type SourceBudgetEntryType = 'Income' | 'Expense';

type SourceCsvImportField =
  | 'Date'
  | 'Amount'
  | 'Withdrawal'
  | 'Deposit'
  | 'Fee'
  | 'Description'
  | 'Ignore';

interface SourceCsvImportPreset {
  id: number;
  name: string;
  fields: SourceCsvImportField[] | string;
  dateFormat: string;
  delimiter: string;
  decimal: string;
  rowsToSkipStart: number;
  rowsToSkipEnd: number;
  deletedAt: string | null;
}

interface SourceBankAccount {
  id: number;
  name: string;
  initialBalance: number;
  balance: number;
  currency: string;
  csvImportPresetId: number | null;
  deletedAt: string | null;
}

interface SourceCategory {
  id: number;
  name: string;
  importPatterns: string[] | string;
  deletedAt: string | null;
}

interface SourceAccountTransaction {
  id: number;
  accountId: number;
  date: string;
  amount: number;
  description: string;
  type: SourceTransactionType;
  categoryId: number | null;
  deletedAt: string | null;
}

interface SourceBudget {
  id: number;
  granularity: SourceBudgetGranularity;
}

interface SourceBudgetEntry {
  id: number;
  type: SourceBudgetEntryType;
  budgetId: number;
  categoryId: number;
  target: number;
}

interface SourceDB {
  csvImportPreset: SourceCsvImportPreset;
  bankAccount: SourceBankAccount;
  category: SourceCategory;
  accountTransaction: SourceAccountTransaction;
  budget: SourceBudget;
  budgetEntry: SourceBudgetEntry;
}

const logger = getLogger('importFromElectron');

function parseArrayField<T>(
  value: T[] | string | null | undefined,
  fallback: T[],
): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value !== 'string') {
    return fallback;
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function toCents(value: number): number {
  const [whole = '0', frac = ''] = value.toString().split('.');
  const sign = value < 0 ? -1 : 1;
  const absWhole = whole.replace('-', '');
  const d1 = Number(frac[0] ?? 0);
  const d2 = Number(frac[1] ?? 0);
  const d3 = Number(frac[2] ?? 0);
  const cents = Number(absWhole) * 100 + d1 * 10 + d2;
  return sign * (d3 >= 5 ? cents + 1 : cents);
}

function toDateOnly(value: string): string {
  const maybeDatePrefix = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (maybeDatePrefix?.[1]) {
    return maybeDatePrefix[1];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid transaction date: "${value}"`);
  }

  return date.toISOString().slice(0, 10);
}

function randomCategoryColor(): string {
  const index = Math.floor(Math.random() * CategoryColorHexValues.length);
  return CategoryColorHexValues[index] ?? CategoryColorHexValues[0];
}

async function run() {
  const program = new Command()
    .name('importFromElectron')
    .description('Import data from Electron sqlite DB into Next sqlite DB')
    .requiredOption('--sqlite-path <path>', 'Path to Electron sqlite DB')
    .requiredOption('--user-email <email>', 'User email in target DB')
    .allowUnknownOption(false);

  program.parse(process.argv);
  const options = program.opts<{ sqlitePath: string; userEmail: string }>();

  const sqlitePath = path.resolve(process.cwd(), options.sqlitePath);
  const userEmail = options.userEmail.trim();

  if (!userEmail) {
    throw new Error('`--user-email` must be provided.');
  }

  await fs.access(sqlitePath);

  const sourceDb = new Kysely<SourceDB>({
    dialect: new SqliteDialect({
      database: new SQLite(sqlitePath, { readonly: true }),
    }),
    plugins: [new ParseJSONResultsPlugin()],
  });

  logger.info({ sqlitePath, userEmail }, 'Starting Electron data import');

  try {
    const [
      sourcePresets,
      sourceAccounts,
      sourceCategories,
      sourceTransactions,
    ] = await Promise.all([
      sourceDb
        .selectFrom('csvImportPreset')
        .selectAll()
        .where('deletedAt', 'is', null)
        .orderBy('id', 'asc')
        .execute(),
      sourceDb
        .selectFrom('bankAccount')
        .selectAll()
        .where('deletedAt', 'is', null)
        .orderBy('id', 'asc')
        .execute(),
      sourceDb
        .selectFrom('category')
        .selectAll()
        .where('deletedAt', 'is', null)
        .orderBy('id', 'asc')
        .execute(),
      sourceDb
        .selectFrom('accountTransaction')
        .selectAll()
        .where('deletedAt', 'is', null)
        .orderBy('id', 'asc')
        .execute(),
    ]);

    const [sourceBudgets, sourceBudgetEntries] = await Promise.all([
      sourceDb.selectFrom('budget').selectAll().orderBy('id', 'asc').execute(),
      sourceDb
        .selectFrom('budgetEntry')
        .selectAll()
        .orderBy('id', 'asc')
        .execute(),
    ]);

    await db.transaction().execute(async (trx) => {
      const user = await trx
        .selectFrom('user')
        .select(['id', 'email'])
        .where('email', '=', userEmail)
        .executeTakeFirst();

      if (!user) {
        throw new Error(`No user found for email "${userEmail}"`);
      }

      const userId = user.id;
      logger.info({ userId }, 'Resolved target user');

      const existingAccountRows = await trx
        .selectFrom('bank_account')
        .select('id')
        .where('userId', '=', userId)
        .execute();
      const existingAccountIds = existingAccountRows.map((row) => row.id);

      const existingBudgetRows = await trx
        .selectFrom('budget')
        .select('id')
        .where('userId', '=', userId)
        .execute();
      const existingBudgetIds = existingBudgetRows.map((row) => row.id);

      const existingTransactionIds =
        existingAccountIds.length > 0
          ? (
              await trx
                .selectFrom('account_transaction')
                .select('id')
                .where('accountId', 'in', existingAccountIds)
                .execute()
            ).map((row) => row.id)
          : [];

      if (existingTransactionIds.length > 0) {
        await trx
          .deleteFrom('attachment')
          .where('transactionId', 'in', existingTransactionIds)
          .execute();
      }

      if (existingAccountIds.length > 0) {
        await trx
          .deleteFrom('account_transaction')
          .where('accountId', 'in', existingAccountIds)
          .execute();
      }

      if (existingBudgetIds.length > 0) {
        await trx
          .deleteFrom('budget_entry')
          .where('budgetId', 'in', existingBudgetIds)
          .execute();
      }

      await trx.deleteFrom('budget').where('userId', '=', userId).execute();
      await trx
        .deleteFrom('bank_account')
        .where('userId', '=', userId)
        .execute();
      await trx.deleteFrom('category').where('userId', '=', userId).execute();
      await trx
        .deleteFrom('csv_import_preset')
        .where('userId', '=', userId)
        .execute();

      const presetIdMap = new Map<number, number>();
      for (const preset of sourcePresets) {
        const insertedPreset = await trx
          .insertInto('csv_import_preset')
          .values({
            userId,
            name: preset.name,
            fields: JSON.stringify(
              parseArrayField<SourceCsvImportField>(preset.fields, []),
            ),
            dateFormat: preset.dateFormat,
            delimiter: preset.delimiter,
            decimal: preset.decimal,
            rowsToSkipStart: preset.rowsToSkipStart,
            rowsToSkipEnd: preset.rowsToSkipEnd,
          })
          .returning('id')
          .executeTakeFirstOrThrow();

        presetIdMap.set(preset.id, insertedPreset.id);
      }

      const categoryIdMap = new Map<number, number>();
      for (const category of sourceCategories) {
        const insertedCategory = await trx
          .insertInto('category')
          .values({
            userId,
            name: category.name,
            color: randomCategoryColor(),
            importPatterns: JSON.stringify(
              parseArrayField<string>(category.importPatterns, []),
            ),
          })
          .returning('id')
          .executeTakeFirstOrThrow();

        categoryIdMap.set(category.id, insertedCategory.id);
      }

      const accountIdMap = new Map<number, number>();
      for (const account of sourceAccounts) {
        const insertedAccount = await trx
          .insertInto('bank_account')
          .values({
            userId,
            name: account.name,
            initialBalance: toCents(account.initialBalance),
            balance: toCents(account.balance),
            currency: account.currency,
            csvImportPresetId: account.csvImportPresetId
              ? (presetIdMap.get(account.csvImportPresetId) ?? null)
              : null,
          })
          .returning('id')
          .executeTakeFirstOrThrow();

        accountIdMap.set(account.id, insertedAccount.id);
      }

      const transactionRows = sourceTransactions
        .map((transaction) => {
          const mappedAccountId = accountIdMap.get(transaction.accountId);
          if (!mappedAccountId) {
            return null;
          }

          return {
            accountId: mappedAccountId,
            date: toDateOnly(transaction.date),
            amount: toCents(transaction.amount),
            description: transaction.description,
            type: transaction.type,
            categoryId: transaction.categoryId
              ? (categoryIdMap.get(transaction.categoryId) ?? null)
              : null,
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (transactionRows.length > 0) {
        await trx
          .insertInto('account_transaction')
          .values(transactionRows)
          .execute();
      }

      const budgetIdMap = new Map<number, number>();
      for (const budget of sourceBudgets) {
        const insertedBudget = await trx
          .insertInto('budget')
          .values({
            userId,
            granularity: budget.granularity,
          })
          .returning('id')
          .executeTakeFirstOrThrow();
        budgetIdMap.set(budget.id, insertedBudget.id);
      }

      const budgetEntryRows = sourceBudgetEntries
        .map((entry) => {
          const mappedBudgetId = budgetIdMap.get(entry.budgetId);
          const mappedCategoryId = categoryIdMap.get(entry.categoryId);

          if (!mappedBudgetId || !mappedCategoryId) {
            return null;
          }

          return {
            type: entry.type,
            budgetId: mappedBudgetId,
            categoryId: mappedCategoryId,
            target: toCents(entry.target),
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      if (budgetEntryRows.length > 0) {
        await trx.insertInto('budget_entry').values(budgetEntryRows).execute();
      }

      for (const [, newAccountId] of accountIdMap) {
        const account = await trx
          .selectFrom('bank_account')
          .select('initialBalance')
          .where('id', '=', newAccountId)
          .executeTakeFirstOrThrow();
        const transactions = await trx
          .selectFrom('account_transaction')
          .select('amount')
          .where('accountId', '=', newAccountId)
          .where('deletedAt', 'is', null)
          .execute();
        await trx
          .updateTable('bank_account')
          .set({
            balance: transactions.reduce(
              (sum, t) => sum + t.amount,
              account.initialBalance,
            ),
          })
          .where('id', '=', newAccountId)
          .execute();
      }

      logger.info(
        {
          imported: {
            presets: presetIdMap.size,
            categories: categoryIdMap.size,
            accounts: accountIdMap.size,
            transactions: transactionRows.length,
            budgets: budgetIdMap.size,
            budgetEntries: budgetEntryRows.length,
          },
        },
        'Electron data import completed',
      );
    });
  } finally {
    await sourceDb.destroy();
    await db.destroy();
  }
}

run()
  .catch((error) => {
    logger.error({ error }, `❌ import failed: ${error}`);
    process.exit(1);
  })
  .then(() => {
    logger.info('✅ import completed');
    process.exit(0);
  });
