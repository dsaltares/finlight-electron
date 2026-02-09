import { type Procedure, procedure } from '@server/trpc';
import { convertAmount, getRates } from '@server/reports/utils';
import db from '@server/db';
import { UpdateBudgetInput, UpdateBudgetOutput } from './types';
import { ensureBudgetExists } from './utils';

const updateBudget: Procedure<UpdateBudgetInput, UpdateBudgetOutput> = async ({
  input: { granularity, currency = 'EUR', entries },
}) => {
  const [budget, rates] = await Promise.all([
    ensureBudgetExists(),
    getRates([currency]),
  ]);
  const desiredGranularity = granularity || budget.granularity;
  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable('budget')
      .set({ granularity: desiredGranularity })
      .where('id', '=', budget.id)
      .execute();
    await trx
      .deleteFrom('budgetEntry')
      .where('budgetId', '=', budget.id)
      .execute();
    await trx
      .insertInto('budgetEntry')
      .values(
        entries.map((entry) => ({
          budgetId: budget.id,
          categoryId: entry.categoryId,
          type: entry.type,
          target: convertAmount(entry.target, currency, 'EUR', rates),
        })),
      )
      .execute();
  });
};

export default procedure
  .input(UpdateBudgetInput)
  .output(UpdateBudgetOutput)
  .mutation(updateBudget);
