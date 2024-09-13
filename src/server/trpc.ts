import { initTRPC } from '@trpc/server';

export type ProcedureArgs<TInput> = {
  input: TInput;
};
export type Procedure<TInput, TOutput> = (
  args: ProcedureArgs<TInput>,
) => Promise<TOutput>;

const trpc = initTRPC.create();
export const procedure = trpc.procedure;

export default trpc;
