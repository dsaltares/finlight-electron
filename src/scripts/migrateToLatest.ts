import { migrateToLatest } from '@server/db/migrations';
import { getUserSettings } from '@server/userSettings/store';
import { getDbPath } from '@server/userSettings/utils';

void main();

async function main() {
  const settings = getUserSettings();
  const dbPath = getDbPath(settings);
  await migrateToLatest(dbPath);
}
