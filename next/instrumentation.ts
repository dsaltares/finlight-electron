import { migrateToLatest } from '@/server/migrate';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.NODE_ENV === 'production') {
      await migrateToLatest();
    }

    const { initCron } = await import('./server/cron/initCron');
    initCron();
  }
}
