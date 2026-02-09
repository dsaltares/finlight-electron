import { Kysely, SqliteDialect } from 'kysely';
import SQLite from 'better-sqlite3';
import type { DB } from '@/server/kysely.ts';

const dialect = new SqliteDialect({
  database: new SQLite(process.env.DATABASE_URL as string),
});

export const db = new Kysely<DB>({
  dialect,
});

export const unknownDb = new Kysely<Record<string, never>>({
  dialect,
});
