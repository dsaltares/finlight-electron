import { TRPCError } from '@trpc/server';
import z from 'zod';
import { db } from '@/server/db';
import { authedProcedure } from '@/server/trpc/trpc';

const UserSettingsSchema = z.object({
  defaultCurrency: z.string().default('EUR'),
});

type UserSettings = z.infer<typeof UserSettingsSchema>;

const get = authedProcedure
  .input(z.void())
  .output(UserSettingsSchema)
  .query(async ({ ctx }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const row = await db
      .selectFrom('user_settings')
      .select('settings')
      .where('userId', '=', ctx.user.id)
      .executeTakeFirst();

    if (!row) {
      return UserSettingsSchema.parse({});
    }
    return UserSettingsSchema.parse(row.settings);
  });

const update = authedProcedure
  .input(UserSettingsSchema.partial())
  .output(UserSettingsSchema)
  .mutation(async ({ ctx, input }) => {
    if (!ctx.user?.id) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const existing = await db
      .selectFrom('user_settings')
      .select('settings')
      .where('userId', '=', ctx.user.id)
      .executeTakeFirst();

    const current = existing
      ? UserSettingsSchema.parse(existing.settings)
      : UserSettingsSchema.parse({});

    const merged: UserSettings = { ...current, ...input };

    await db
      .insertInto('user_settings')
      .values({
        userId: ctx.user.id,
        settings: JSON.stringify(merged),
      })
      .onConflict((oc) =>
        oc.column('userId').doUpdateSet({
          settings: JSON.stringify(merged),
        }),
      )
      .execute();

    return merged;
  });

export async function getUserDefaultCurrency(userId: string): Promise<string> {
  const row = await db
    .selectFrom('user_settings')
    .select('settings')
    .where('userId', '=', userId)
    .executeTakeFirst();

  if (!row) return 'EUR';
  const parsed = UserSettingsSchema.safeParse(row.settings);
  return parsed.success ? parsed.data.defaultCurrency : 'EUR';
}

export default {
  get,
  update,
};
