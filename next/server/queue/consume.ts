import { sql } from 'kysely';
import { db } from '../db';
import { getLogger } from '../logger';
import { eventRegistry } from './registry';

const logger = getLogger('consume');

const DefaultConcurrency = 10;

export default async function consume() {
  const claimed = await db.transaction().execute(async (trx) => {
    const processingCountRow = await db
      .selectFrom('event')
      .select((eb) => [eb.fn.countAll().as('count')])
      .where('status', '=', 'processing')
      .executeTakeFirst();
    const currentlyProcessing = Number(processingCountRow?.count ?? 0);
    const concurrency = process.env.CONCURRENCY
      ? parseInt(process.env.CONCURRENCY, 10)
      : DefaultConcurrency;
    const availableSlots = Math.max(0, concurrency - currentlyProcessing);
    if (availableSlots === 0) {
      return [];
    }

    logger.info(`Available slots: ${availableSlots}`);

    const updated = await trx
      .with('cte', (qb) =>
        qb
          .selectFrom('event')
          .select(['id', 'event', 'input'])
          .where('status', '=', 'pending')
          .where((eb) =>
            eb.or([
              eb('environment', '=', process.env.ENVIRONMENT ?? 'production'),
              eb('environment', 'is', null),
            ]),
          )
          .orderBy('created_at', 'asc')
          .limit(availableSlots)
          .forUpdate()
          .skipLocked(),
      )
      .updateTable('event as e')
      .set({
        status: 'processing',
        started_at: new Date(),
        updated_at: new Date(),
      })
      .from('cte')
      .whereRef('e.id', '=', 'cte.id')
      .returning(['e.id as id', 'e.event as event', 'e.input as input'])
      .execute();

    return updated;
  });

  logger.info(
    `Claimed: ${claimed.length} for environment: ${process.env.ENVIRONMENT}`,
  );

  if (!claimed.length) {
    return { claimed: 0, failed: 0 };
  }

  const results = await Promise.all(
    claimed.map(
      async (event: { id: string; event: string; input: unknown }) => {
        async function markEventFailed(error: unknown) {
          await db
            .updateTable('event')
            .set({
              status: 'failed',
              failed_at: new Date(),
              updated_at: new Date(),
              error: sql`${JSON.stringify(error)}::jsonb`,
            })
            .where('id', '=', event.id)
            .execute();
        }

        const handler = eventRegistry[event.event];
        if (!handler) {
          const error = {
            message: `No handler registered for event: ${event.event}`,
          };
          await markEventFailed(error);
          logger.error(`Event ${event.id} failed: ${error.message}`);
          return { id: event.id, ok: false };
        }

        try {
          const { result, cost } = await handler(event.input);

          await db
            .updateTable('event')
            .set({
              status: 'completed',
              completed_at: new Date(),
              updated_at: new Date(),
              output: sql`${JSON.stringify(result)}::jsonb`,
              cost,
            })
            .where('id', '=', event.id)
            .execute();

          return { id: event.id, ok: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : 'request failed';
          const error = {
            message,
            stack: err instanceof Error ? err.stack : undefined,
          };
          await markEventFailed(error);
          logger.error(`Event ${event.id} failed: ${message}`);
          return { id: event.id, ok: false };
        }
      },
    ),
  );

  const failed = results.filter((r) => !r.ok).length;
  return { claimed: claimed.length, failed };
}
