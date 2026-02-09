import { createContext } from './context';
import { appRouter } from './router';

export const caller = appRouter.createCaller(
  await createContext({
    headers: new Headers({ 'x-api-key': process.env.API_KEY as string }),
  }),
);
