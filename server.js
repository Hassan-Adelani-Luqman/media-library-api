import app from './src/app.js';
import { config } from './src/config/env.js';
import { logger } from './src/config/logger.js';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception, shutting down', { reason: err.message, stack: err.stack });
  process.exit(1);
});

const server = app.listen(config.port, () => {
  logger.info('Server started', { port: config.port, env: config.nodeEnv });
});

process.on('unhandledRejection', (err) => {
  logger.error('Promise rejection, shutting down', { reason: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});
