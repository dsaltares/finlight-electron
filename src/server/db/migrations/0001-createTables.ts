import type { Migration } from 'kysely';
import { sql } from 'kysely';

const createTables: Migration = {
  up: async function (db) {
    await db.schema
      .createTable('exchangeRate')
      .addColumn('id', 'integer', (col) => col.primaryKey())
      .addColumn('ticker', 'text', (col) => col.notNull())
      .addColumn('open', 'real', (col) => col.notNull())
      .addColumn('low', 'real', (col) => col.notNull())
      .addColumn('high', 'real', (col) => col.notNull())
      .addColumn('close', 'real', (col) => col.notNull())
      .addColumn('date', 'text', (col) => col.notNull())
      .addColumn('createdAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('updatedAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addUniqueConstraint('unique_exchangeRate_ticker_date', [
        'ticker',
        'date',
      ])
      .execute();

    await sql`
      CREATE TRIGGER exchangeRate_updatedAt_trigger AFTER UPDATE ON exchangeRate
      BEGIN
        update exchangeRate SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
      `.execute(db);

    await db.schema
      .createTable('csvImportPreset')
      .addColumn('id', 'integer', (col) => col.primaryKey())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('fields', 'jsonb', (col) => col.notNull())
      .addColumn('dateFormat', 'text', (col) => col.notNull())
      .addColumn('delimiter', 'text', (col) => col.notNull())
      .addColumn('decimal', 'text', (col) => col.notNull())
      .addColumn('rowsToSkipStart', 'integer', (col) =>
        col.notNull().defaultTo(0),
      )
      .addColumn('rowsToSkipEnd', 'integer', (col) =>
        col.notNull().defaultTo(0),
      )
      .addColumn('createdAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('updatedAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('deletedAt', 'text')
      .execute();

    await sql`
      CREATE TRIGGER csvImportPreset_updatedAt_trigger AFTER UPDATE ON csvImportPreset
      BEGIN
        update csvImportPreset SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
      `.execute(db);

    await db.schema
      .createTable('bankAccount')
      .addColumn('id', 'integer', (col) => col.primaryKey())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('initialBalance', 'real', (col) => col.notNull().defaultTo(0))
      .addColumn('balance', 'real', (col) => col.notNull().defaultTo(0))
      .addColumn('currency', 'text', (col) => col.notNull().defaultTo('EUR'))
      .addColumn('csvImportPresetId', 'integer')
      .addColumn('createdAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('updatedAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('deletedAt', 'text')
      .addForeignKeyConstraint(
        'csvImportPresetId_foreign',
        ['csvImportPresetId'],
        'csvImportPreset',
        ['id'],
      )
      .addUniqueConstraint('unique_bankAccount_name', ['name'])
      .execute();

    await sql`
      CREATE TRIGGER bankAccount_updatedAt_trigger AFTER UPDATE ON bankAccount
      BEGIN
        update bankAccount SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
      `.execute(db);

    await db.schema
      .createTable('category')
      .addColumn('id', 'integer', (col) => col.primaryKey())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('importPatterns', 'jsonb', (col) => col.notNull())
      .addColumn('createdAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('updatedAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('deletedAt', 'text')
      .addUniqueConstraint('unique_category_name', ['name'])
      .execute();

    await sql`
      CREATE TRIGGER category_updatedAt_trigger AFTER UPDATE ON category
      BEGIN
        update category SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
      `.execute(db);

    await db.schema
      .createTable('accountTransaction')
      .addColumn('id', 'integer', (col) => col.primaryKey())
      .addColumn('amount', 'real', (col) => col.notNull())
      .addColumn('date', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('description', 'text', (col) => col.notNull().defaultTo(''))
      .addColumn('accountId', 'integer', (col) => col.notNull())
      .addColumn('type', 'text', (col) =>
        col
          .notNull()
          .check(sql`type IN ('Income', 'Expense', 'Transfer')`)
          .defaultTo('Expense'),
      )
      .addColumn('categoryId', 'integer')
      .addColumn('createdAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('updatedAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('deletedAt', 'text')
      .addForeignKeyConstraint(
        'accountTransaction_accountId_foreign',
        ['accountId'],
        'bankAccount',
        ['id'],
      )
      .addForeignKeyConstraint(
        'accountTransaction_categoryId_foreign',
        ['categoryId'],
        'category',
        ['id'],
      )
      .execute();

    await sql`
      CREATE TRIGGER accountTransaction_updatedAt_trigger AFTER UPDATE ON accountTransaction
      BEGIN
        update accountTransaction SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
      `.execute(db);

    await db.schema
      .createTable('budget')
      .addColumn('id', 'integer', (col) => col.primaryKey())
      .addColumn('granularity', 'text', (col) =>
        col
          .notNull()
          .check(sql`granularity IN ('Monthly', 'Quarterly', 'Yearly')`)
          .defaultTo('Monthly'),
      )
      .addColumn('createdAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('updatedAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .execute();

    await sql`
      CREATE TRIGGER budget_updatedAt_trigger AFTER UPDATE ON budget
      BEGIN
        update budget SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
      `.execute(db);

    await db.schema
      .createTable('budgetEntry')
      .addColumn('id', 'integer', (col) => col.primaryKey())
      .addColumn('type', 'text', (col) =>
        col.notNull().check(sql`type IN ('Income', 'Expense')`),
      )
      .addColumn('budgetId', 'integer', (col) => col.notNull())
      .addColumn('categoryId', 'integer', (col) => col.notNull())
      .addColumn('target', 'real', (col) => col.notNull())
      .addColumn('createdAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('updatedAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addForeignKeyConstraint(
        'budgetEntry_categoryId_foreign',
        ['categoryId'],
        'category',
        ['id'],
      )
      .addForeignKeyConstraint(
        'budgetEntry_budgetId_foreign',
        ['budgetId'],
        'budget',
        ['id'],
      )
      .execute();

    await sql`
      CREATE TRIGGER budgetEntry_updatedAt_trigger AFTER UPDATE ON budgetEntry
      BEGIN
        update budgetEntry SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
      `.execute(db);
  },
  down: async function (db) {
    await db.schema.dropTable('exchangeRate').execute();
    await db.schema.dropTable('accountTransaction').execute();
    await db.schema.dropTable('bankAccount').execute();
    await db.schema.dropTable('csvImportPreset').execute();
    await db.schema.dropTable('category').execute();
    await db.schema.dropTable('budgetEntry').execute();
    await db.schema.dropTable('budget').execute();
  },
};

export default createTables;
