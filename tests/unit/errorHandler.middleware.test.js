import multer from 'multer';
import { errorHandler } from '../../src/middlewares/errorHandler.middleware.js';
import { AppError } from '../../src/utils/AppError.js';

jest.mock('../../src/config/logger.js', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const req = { originalUrl: '/media/123', method: 'GET' };

describe('errorHandler middleware', () => {
  it('returns the operational error status code and message', () => {
    const res = mockRes();
    errorHandler(new AppError('Media not found', 404), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Media not found' });
  });

  it('includes details for validation errors', () => {
    const res = mockRes();
    const details = [{ field: 'title', message: 'Title is required' }];
    errorHandler(new AppError('Validation failed', 400, details), req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Validation failed', details });
  });

  it('masks non-operational errors with a generic 500 message', () => {
    const res = mockRes();
    errorHandler(new Error('unexpected db failure'), req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Something went wrong' });
  });

  it('converts a Multer file-size error into a 400 AppError', () => {
    const res = mockRes();
    const multerError = new multer.MulterError('LIMIT_FILE_SIZE');
    errorHandler(multerError, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.stringContaining('too large'),
    });
  });

  it('converts other Multer errors into a 400 AppError', () => {
    const res = mockRes();
    const multerError = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
    errorHandler(multerError, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].status).toBe('error');
  });
});
