import path from 'path';
import { app } from 'electron';
import pino from 'pino';

const logger = pino(
  pino.transport({
    target: 'pino/file',
    options: {
      destination: path.join(app.getPath('userData'), 'logs/finlight.log'),
      mkdir: true,
      interval: '1d',
      archive: true,
      name: 'finlight',
    },
  }),
);

logger.info('Log rotation with pino/file');

export default logger;
