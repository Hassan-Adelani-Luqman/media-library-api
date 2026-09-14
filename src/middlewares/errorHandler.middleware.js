import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

function normalizeError(err) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxMb = config.maxFileSizeBytes / (1024 * 1024);
      return new AppError(`File is too large. Maximum size is ${maxMb}MB`, 400);
    }
    return new AppError(err.message, 400);
  }
  return err;
}

function logError(error, req) {
  const meta = { path: req.originalUrl, method: req.method };

  if (!error.isOperational) {
    logger.error('Unhandled global error', { ...meta, reason: error.message, stack: error.stack });
    return;
  }

  if (error.statusCode === 404) {
    logger.warn('Resource not found', { ...meta, reason: error.message });
    return;
  }

  if (error.message === 'Validation failed') {
    logger.warn('Validation error', { ...meta, details: error.details });
    return;
  }

  logger.warn(error.message, meta);
}

export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  logError(error, req);

  res.status(statusCode).json({
    status: 'error',
    message: isOperational ? error.message : 'Something went wrong',
    ...(error.details && error.details.length ? { details: error.details } : {}),
  });
};
