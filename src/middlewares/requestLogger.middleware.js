import { logger } from '../config/logger.js';

export const requestLogger = (req, res, next) => {
  logger.info('Incoming request', { method: req.method, url: req.originalUrl });
  next();
};
