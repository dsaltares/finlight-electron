import cron from 'node-cron';
import { getLogger } from '../logger';
import consume from '../queue/consume';

const logger = getLogger('cron');

let initialized = false;

export async function initCron() {
  if (initialized || process.env.ENABLE_CRON !== 'true') {
    return;
  }

  initialized = true;

  cron.schedule('*/5 * * * * *', async () => {
    try {
      await consume();
    } catch (error) {
      logger.error({ error }, 'Error in consume cron job');
    }
  });

  logger.info('Cron initialized ✅');
}
