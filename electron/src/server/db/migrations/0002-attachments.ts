import type { Migration } from 'kysely';
import { sql } from 'kysely';

const attachments: Migration = {
  up: async function (db) {
    await db.schema
      .createTable('attachment')
      .addColumn('id', 'integer', (col) => col.primaryKey())
      .addColumn('filename', 'text', (col) => col.notNull())
      .addColumn('transactionId', 'integer', (col) => col.notNull())
      .addColumn('type', 'text', (col) => col.notNull())
      .addColumn('createdAt', 'text', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
      )
      .addColumn('deletedAt', 'text')
      .addForeignKeyConstraint(
        'attachment_transactionId_foreign',
        ['transactionId'],
        'accountTransaction',
        ['id'],
      )
      .addUniqueConstraint('unique_attachment_transactionId_filename', [
        'transactionId',
        'filename',
      ])
      .execute();
  },
  down: async function (db) {
    await db.schema.dropTable('attachment').execute();
  },
};

export default attachments;
