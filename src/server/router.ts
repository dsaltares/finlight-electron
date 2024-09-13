import { z } from 'zod';
import trpc, { procedure } from './trpc';

const router = trpc.router({
  helloWorld: procedure
    .input(z.object({ name: z.string() }))
    .output(z.object({ message: z.string() }))
    .query(async ({ input: { name } }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { message: `Hello, ${name}!` };
    }),
});

export default router;

export type AppRouter = typeof router;
