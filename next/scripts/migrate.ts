import { promises as fs } from 'node:fs';
import path from 'node:path';
import { FileMigrationProvider, Migrator } from 'kysely';
import { unknownDb } from '@/server/db';
import { getLogger } from '@/server/logger';

const logger = getLogger('migrate');

async function run() {
  const migrationsFolder = path.resolve(process.cwd(), 'migrations');

  const migrator = new Migrator({
    db: unknownDb,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: migrationsFolder,
    }),
  });

  const direction =
    (process.argv[2] as 'up' | 'down' | 'latest' | 'to' | undefined) ??
    'latest';

  if (direction === 'down') {
    const result = await migrator.migrateDown();
    if (result.error) throw result.error;
    for (const m of result.results ?? [])
      logger.info(`⏬ rolled back: ${m.migrationName}`);
    logger.info('✅ migration down complete');
    return;
  }

  if (direction === 'to') {
    const target = process.argv[3];
    if (!target) {
      throw new Error('Usage: migrate to <migration_name>');
    }
    const result = await migrator.migrateTo(target);
    if (result.error) throw result.error;
    for (const m of result.results ?? []) {
      logger.info(`➡️ migrated: ${m.migrationName}`);
    }
    logger.info(`✅ migrated to ${target}`);
    return;
  }

  const result = await migrator.migrateToLatest();
  if (result.error) throw result.error;
  for (const m of result.results ?? []) {
    logger.info(`⬆️ applied: ${m.migrationName}`);
  }
  logger.info('✅ migration up-to-date');
}

run()
  .catch((error) => {
    logger.error({ error }, `❌ migration failed: ${error}`);
    process.exit(1);
  })
  .then(() => {
    logger.info('✅ migration completed');
    process.exit(0);
  });
