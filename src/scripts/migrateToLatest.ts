import { migrateToLatest } from '@db/migrations';

void main();

async function main() {
  await migrateToLatest();
}
