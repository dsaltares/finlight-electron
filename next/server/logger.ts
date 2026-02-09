import pino from 'pino';
import pinoPretty from 'pino-pretty';

export const logger = pino(
  {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  },
  process.env.NODE_ENV !== 'production'
    ? pinoPretty({ colorize: true })
    : undefined,
);

export function getLogger(moduleName: string) {
  return logger.child({ module: moduleName });
}
