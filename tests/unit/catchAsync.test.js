import { catchAsync } from '../../src/utils/catchAsync.js';

describe('catchAsync', () => {
  it('forwards a rejected promise to next()', async () => {
    const error = new Error('boom');
    const handler = catchAsync(async () => {
      throw error;
    });
    const next = jest.fn();

    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next() when the handler resolves', async () => {
    const handler = catchAsync(async (req, res) => {
      res.send('ok');
    });
    const res = { send: jest.fn() };
    const next = jest.fn();

    await handler({}, res, next);

    expect(res.send).toHaveBeenCalledWith('ok');
    expect(next).not.toHaveBeenCalled();
  });
});
