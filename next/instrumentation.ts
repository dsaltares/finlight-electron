export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initCron } = await import('./server/cron/initCron');
    initCron();
  }
}
