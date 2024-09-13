import { migrateToLatest } from '@server/db/migrations';

void main();

async function main() {
  await migrateToLatest();
}
