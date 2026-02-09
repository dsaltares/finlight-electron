import cron from 'node-cron';
import { getLogger } from '../logger';
import { refreshRates } from '../polygon';

const logger = getLogger('cron');

let initialized = false;

export async function initCron() {
  if (initialized || process.env.ENABLE_CRON !== 'true') {
    return;
  }

  initialized = true;

  cron.schedule('0 0 * * *', async () => {
    try {
      await refreshRates();
    } catch (error) {
      logger.error({ error }, 'Error in refreshExchangeRates cron job');
    }
  });

  logger.info('Cron initialized ✅');
}
