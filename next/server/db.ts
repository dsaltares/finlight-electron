import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import type { DB } from '@/server/kysely.ts';
import { getLogger } from './logger';

const logger = getLogger('db');

const dialect = new SqliteDialect({
  database: new SQLite(process.env.DATABASE_URL as string),
});

export const db = new Kysely<DB>({
  dialect,
  plugins: [new ParseJSONResultsPlugin()],
  log(event) {
    if (event.level === 'error') {
      logger.error(
        {
          durationMs: event.queryDurationMillis,
          sql: event.query.sql,
          params: event.query.parameters,
          error: event.error,
        },
        'Query failed',
      );
    }
  },
});

export const unknownDb = new Kysely<Record<string, never>>({
  dialect,
  plugins: [new ParseJSONResultsPlugin()],
});
