import type { Migration } from 'kysely';
import { Migrator } from 'kysely';
import * as m001 from '@/migrations/001_better-auth';
import * as m002 from '@/migrations/002_electron_schema';
import * as m003 from '@/migrations/003_csv_import_preset_user_name_unique';
import * as m004 from '@/migrations/004_category_color';
import * as m005 from '@/migrations/005_user_settings';
import * as m006 from '@/migrations/006_budget';
import { unknownDb } from '@/server/db';
import { getLogger } from '@/server/logger';

const logger = getLogger('migrate');

const migrations: Record<string, Migration> = {
  '001_better-auth': m001,
  '002_electron_schema': m002,
  '003_csv_import_preset_user_name_unique': m003,
  '004_category_color': m004,
  '005_user_settings': m005,
  '006_budget': m006,
};

export function createMigrator() {
  return new Migrator({
    db: unknownDb,
    provider: { getMigrations: async () => migrations },
  });
}

export async function migrateToLatest() {
  const migrator = createMigrator();
  const result = await migrator.migrateToLatest();
  if (result.error) throw result.error;
  for (const m of result.results ?? []) {
    logger.info(`➡️ migrated: ${m.migrationName}`);
  }
  logger.info('✅ migrations up-to-date');
}
