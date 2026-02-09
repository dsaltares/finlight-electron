import { db } from '../db';
import { getLogger } from '../logger';

const logger = getLogger('resetStuckEvents');

export async function resetStuckEvents() {
  logger.info('Resetting stuck "processing" events to "pending"...');
  const result = await db
    .updateTable('event')
    .set({
      status: 'pending',
      updated_at: new Date(),
      started_at: null,
    })
    .where('status', '=', 'processing')
    .where('environment', '=', process.env.ENVIRONMENT ?? 'production')
    .returning(['id'])
    .execute();

  if (result.length > 0) {
    logger.info(`Reset ${result.length} stuck events back to pending`);
  } else {
    logger.info('No stuck events found');
  }
}
