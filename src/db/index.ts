import SQLite from 'better-sqlite3';
import { Kysely, Migrator, SqliteDialect } from 'kysely';
import type { Database } from './types';
import ProgrammaticMigrationProvider from './migrations/ProgrammaticMigrationProvider';

const db = createDb();

function createDb() {
  const dialect = new SqliteDialect({
    database: new SQLite(':memory:'),
  });
  return new Kysely<Database>({
    dialect,
  });
}

export async function migrateToLatest() {
  const dbToMigrate = createDb();

  const migrator = new Migrator({
    db: dbToMigrate,
    provider: new ProgrammaticMigrationProvider(),
  });

  const { error, results } = await migrator.migrateToLatest();

  results.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  await dbToMigrate.destroy();
}

export default db;
