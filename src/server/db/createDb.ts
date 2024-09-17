import { app } from 'electron';
import path from 'path';
import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import type { Database } from './types';

export default function createDb() {
  const dbPath = getDbPath();
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

function getDbPath() {
  if (app.isPackaged) {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'db.sqlite');
  }
  return './db.sqlite';
}
