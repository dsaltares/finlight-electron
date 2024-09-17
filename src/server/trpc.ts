import { initTRPC } from '@trpc/server';
import { formatNumber } from '@lib/format';

export type ProcedureArgs<TInput> = {
  input: TInput;
};
export type Procedure<TInput, TOutput> = (
  args: ProcedureArgs<TInput>,
) => Promise<TOutput>;

const trpc = initTRPC.create();

const loggingMiddleware = trpc.middleware(async ({ path, type, next }) => {
  const start = performance.now();
  const result = await next();
  const durationMs = performance.now() - start;
  const durationStr = formatNumber(durationMs);

  result.ok
    ? console.log(`tRPC OK - ${path}.${type} - ${durationStr}ms`)
    : console.error(
        `tRPC ERROR - ${path}.${type} - ${durationStr}ms - ${result.error.message} - ${result.error.stack}`,
      );

  return result;
});

export const procedure = trpc.procedure.use(loggingMiddleware);

export default trpc;
