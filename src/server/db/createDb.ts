import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import { getUserSettings } from '@server/userSettings/store';
import type { Database } from './types';

export default function createDb() {
  const settings = getUserSettings();
  console.log(`Using database at ${settings.dbPath}`);
  return new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(settings.dbPath),
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
