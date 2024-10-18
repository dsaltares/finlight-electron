import fs from 'fs';
import path from 'path';
import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import { fileExistsSync } from '@server/utils';
import type { Database } from './types';

export default function createDb(dbPath: string) {
  ensureDataFolderExists(dbPath);

  console.log(`Using database at ${dbPath}`);
  return new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(dbPath),
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
}

function ensureDataFolderExists(dbPath: string) {
  const dir = path.dirname(dbPath);
  console.log('Ensuring data directory exists', dir);

  if (!fileExistsSync(dir)) {
    console.log('Creating data directory');
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log('Data directory exists', dir);
  }
}
