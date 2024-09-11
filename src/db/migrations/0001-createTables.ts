import { Migration, sql } from "kysely";

const createExchangeRate: Migration = {
  up: async function (db) {
    await db.schema
      .createTable('exchangeRate')
      .addColumn('id', 'integer', col => col.primaryKey())
      .addColumn('ticker', 'text', col=> col.notNull())
      .addColumn('open', 'real', col=> col.notNull())
      .addColumn('low', 'real', col=> col.notNull())
      .addColumn('high', 'real', col=> col.notNull())
      .addColumn('close', 'real', col=> col.notNull())
      .addColumn('date', 'text', col=> col.notNull())
      .addColumn('createdAt', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .addColumn('updatedAt', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
      .addUniqueConstraint('unique_exchangeRate_ticker_date', ['ticker', 'date'])
      .execute()

    await sql`
      CREATE TRIGGER exchangeRate_updatedAt_trigger AFTER UPDATE ON exchangeRate
      BEGIN
        update exchangeRate SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
      `.execute(db)
  },
  down: async function (db){
    await db.schema.dropTable('exchangeRate').execute()
  }
}

export default createExchangeRate;


