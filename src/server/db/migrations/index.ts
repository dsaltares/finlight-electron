import { Migrator } from 'kysely';
import createDb from '../createDb';
import logger from '@server/logger';
import ProgrammaticMigrationProvider from './ProgrammaticMigrationProvider';

export async function migrateToLatest(dbPath: string) {
  const db = createDb(dbPath);

  const migrator = new Migrator({
    db,
    provider: new ProgrammaticMigrationProvider(),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      logger.info(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      logger.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    logger.error('failed to migrate');
    logger.error(error);
    process.exit(1);
  }

  await db.destroy();
}
