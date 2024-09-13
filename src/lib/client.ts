import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/router';

const client = createTRPCReact<AppRouter>();
export default client;
