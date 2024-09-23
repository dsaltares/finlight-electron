import { migrateToLatest } from '@server/db/migrations';
import { getUserSettings } from '@server/userSettings/store';

void main();

async function main() {
  await migrateToLatest(getUserSettings().dbPath);
}
