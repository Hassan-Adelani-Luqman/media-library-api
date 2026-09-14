import { AppError } from '../../src/utils/AppError.js';

describe('AppError', () => {
  it('sets message, statusCode, and defaults details to an empty array', () => {
    const error = new AppError('Media not found', 404);

    expect(error.message).toBe('Media not found');
    expect(error.statusCode).toBe(404);
    expect(error.details).toEqual([]);
    expect(error.isOperational).toBe(true);
  });

  it('stores provided details', () => {
    const details = [{ field: 'title', message: 'Title is required' }];
    const error = new AppError('Validation failed', 400, details);

    expect(error.details).toEqual(details);
  });

  it('is an instance of Error with a proper stack trace', () => {
    const error = new AppError('Something went wrong', 500);

    expect(error).toBeInstanceOf(Error);
    expect(error.stack).toBeDefined();
  });
});
