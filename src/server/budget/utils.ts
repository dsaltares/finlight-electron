import { jsonArrayFrom } from 'kysely/helpers/sqlite';
import db from '@server/db';
import type { TimeGranularity } from './types';

export async function ensureBudgetExists() {
  const budgetQuery = db
    .selectFrom('budget')
    .selectAll()
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom('budgetEntry')
          .select([
            'id',
            'categoryId',
            'budgetId',
            'categoryId',
            'target',
            'type',
            'createdAt',
            'updatedAt',
          ])
          .whereRef('budget.id', '=', 'budgetEntry.budgetId'),
      ).as('entries'),
    ]);

  const existingBudget = await budgetQuery.executeTakeFirst();
  if (existingBudget) {
    return existingBudget;
  }

  await db.insertInto('budget').values({ granularity: 'Monthly' }).execute();

  return budgetQuery.executeTakeFirstOrThrow();
}

export const granularityToMonthly = (granularity: TimeGranularity) => {
  switch (granularity) {
    case 'Yearly':
      return 1 / 12;
    case 'Quarterly':
      return 1 / 3;
    default:
      return 1.0;
  }
};

export const monthlyToGranularity = (granularity: TimeGranularity) => {
  switch (granularity) {
    case 'Yearly':
      return 12.0;
    case 'Quarterly':
      return 3.0;
    default:
      return 1.0;
  }
};
