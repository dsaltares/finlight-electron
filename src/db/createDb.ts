import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import type { Database } from './types';

export default function createDb() {
  return new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite('./db.sqlite'),
    }),
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
