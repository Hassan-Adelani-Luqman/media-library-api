import { z } from 'zod';
import { validate } from '../../src/middlewares/validate.middleware.js';
import { AppError } from '../../src/utils/AppError.js';

const schema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
  }),
});

describe('validate middleware', () => {
  it('calls next() with no error and sets req.validated for valid input', () => {
    const req = { body: { title: 'My Title' }, query: {}, params: {} };
    const next = jest.fn();

    validate(schema)(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.validated.body).toEqual({ title: 'My Title' });
  });

  it('calls next() with a 400 AppError and field-level details for invalid input', () => {
    const req = { body: { title: '' }, query: {}, params: {} };
    const next = jest.fn();

    validate(schema)(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Validation failed');
    expect(err.details).toEqual([{ field: 'title', message: 'Title is required' }]);
  });
});
