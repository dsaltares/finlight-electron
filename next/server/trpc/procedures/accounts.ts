import { TRPCError } from '@trpc/server';
import z from 'zod';
import { db } from '@/server/db';
import { authedProcedure } from '@/server/trpc/trpc';

const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  initialBalance: z.number(),
  balance: z.number(),
  currency: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Account = z.infer<typeof AccountSchema>;

const listAccounts = authedProcedure
  .input(z.object({}))
  .output(z.array(AccountSchema))
  .query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return db
      .selectFrom('bank_account')
      .selectAll()
      .where('deletedAt', 'is', null)
      .where('userId', '=', ctx.user.id)
      .orderBy('createdAt', 'asc')
      .execute();
  });

export default {
  list: listAccounts,
};
