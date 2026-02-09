import path from 'path';
import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import { ensureFolderExistsSync } from '@server/utils';
import logger from '@server/logger';
import type { Database } from './types';

export default function createDb(dbPath: string) {
  ensureDataFolderExists(dbPath);

  logger.info(`Using database at ${dbPath}`);
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
      //   logger.info(
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
  logger.info('Ensuring data directory exists', dir);
  ensureFolderExistsSync(dir);
}
