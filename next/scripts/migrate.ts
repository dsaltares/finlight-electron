import { getLogger } from '@/server/logger';
import { createMigrator, migrateToLatest } from '@/server/migrate';

const logger = getLogger('migrate');

async function run() {
  const direction =
    (process.argv[2] as 'up' | 'down' | 'latest' | 'to' | undefined) ??
    'latest';

  if (direction === 'down') {
    const migrator = createMigrator();
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
    const migrator = createMigrator();
    const result = await migrator.migrateTo(target);
    if (result.error) throw result.error;
    for (const m of result.results ?? []) {
      logger.info(`➡️ migrated: ${m.migrationName}`);
    }
    logger.info(`✅ migrated to ${target}`);
    return;
  }

  await migrateToLatest();
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
