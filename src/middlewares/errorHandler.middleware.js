import multer from 'multer';
import { AppError } from '../utils/AppError.js';

function normalizeError(err) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new AppError('File is too large. Maximum size is 5MB', 400);
    }
    return new AppError(err.message, 400);
  }
  return err;
}

export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  if (!isOperational) {
    console.error('UNEXPECTED ERROR:', error);
  }

  res.status(statusCode).json({
    status: 'error',
    message: isOperational ? error.message : 'Something went wrong',
    ...(error.details && error.details.length ? { details: error.details } : {}),
  });
};
