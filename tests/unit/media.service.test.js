import { mediaRepository } from '../../src/repositories/media.repository.js';
import { mediaService } from '../../src/services/media.service.js';
import { AppError } from '../../src/utils/AppError.js';

jest.mock('../../src/repositories/media.repository.js', () => ({
  mediaRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countByFilter: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('mediaService.listMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('computes totalPages by rounding up total / limit', async () => {
    mediaRepository.find.mockResolvedValue([]);
    mediaRepository.countByFilter.mockResolvedValue(25);

    const { pagination } = await mediaService.listMedia({ page: 1, limit: 10 });

    expect(pagination).toEqual({ total: 25, page: 1, limit: 10, totalPages: 3 });
  });

  it('returns totalPages of 1 when there are no results', async () => {
    mediaRepository.find.mockResolvedValue([]);
    mediaRepository.countByFilter.mockResolvedValue(0);

    const { pagination } = await mediaService.listMedia({ page: 1, limit: 10 });

    expect(pagination).toEqual({ total: 0, page: 1, limit: 10, totalPages: 1 });
  });

  it('reflects the requested page and limit in the pagination metadata', async () => {
    mediaRepository.find.mockResolvedValue([]);
    mediaRepository.countByFilter.mockResolvedValue(42);

    const { pagination } = await mediaService.listMedia({ page: 3, limit: 5 });

    expect(pagination).toEqual({ total: 42, page: 3, limit: 5, totalPages: 9 });
  });

  it('fetches page results and total count concurrently', async () => {
    mediaRepository.find.mockResolvedValue([{ id: '1' }]);
    mediaRepository.countByFilter.mockResolvedValue(1);

    const { results } = await mediaService.listMedia({ page: 1, limit: 10 });

    expect(results).toEqual([{ id: '1' }]);
    expect(mediaRepository.find).toHaveBeenCalledTimes(1);
    expect(mediaRepository.countByFilter).toHaveBeenCalledTimes(1);
  });
});

describe('mediaService.getMediaById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws a 404 AppError when the record does not exist', async () => {
    mediaRepository.findById.mockResolvedValue(null);

    await expect(mediaService.getMediaById('missing')).rejects.toMatchObject(
      new AppError('Media not found', 404)
    );
  });

  it('returns the record when found', async () => {
    mediaRepository.findById.mockResolvedValue({ id: '1', title: 'Test' });

    await expect(mediaService.getMediaById('1')).resolves.toEqual({ id: '1', title: 'Test' });
  });
});

describe('mediaService.updateMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws a 404 AppError when the record does not exist', async () => {
    mediaRepository.findById.mockResolvedValue(null);

    await expect(mediaService.updateMedia('missing', { title: 'New' })).rejects.toMatchObject(
      new AppError('Media not found', 404)
    );
    expect(mediaRepository.update).not.toHaveBeenCalled();
  });

  it('only forwards fields that were provided', async () => {
    mediaRepository.findById.mockResolvedValue({ id: '1' });
    mediaRepository.update.mockResolvedValue({ id: '1', title: 'New', tags: ['a', 'b'] });

    await mediaService.updateMedia('1', { title: 'New', tags: 'a,b' });

    expect(mediaRepository.update).toHaveBeenCalledWith('1', { title: 'New', tags: ['a', 'b'] });
  });
});

describe('mediaService.createMedia', () => {
  it('parses tags and delegates the record to the repository', async () => {
    mediaRepository.create.mockImplementation((record) => record);

    const result = await mediaService.createMedia(
      { filePath: '/tmp/a.png', originalName: 'a.png', mimeType: 'image/png', fileSize: 10 },
      { title: 'A', tags: 'x, y', category: 'image' }
    );

    expect(result.tags).toEqual(['x', 'y']);
    expect(result.title).toBe('A');
    expect(mediaRepository.create).toHaveBeenCalledTimes(1);
  });
});

describe('mediaService.deleteMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws a 404 AppError when the record does not exist', async () => {
    mediaRepository.findById.mockResolvedValue(null);

    await expect(mediaService.deleteMedia('missing')).rejects.toMatchObject(
      new AppError('Media not found', 404)
    );
    expect(mediaRepository.delete).not.toHaveBeenCalled();
  });

  it('deletes the record and returns it', async () => {
    mediaRepository.findById.mockResolvedValue({ id: '1', filePath: '/tmp/does-not-exist.png' });
    mediaRepository.delete.mockResolvedValue(true);

    await expect(mediaService.deleteMedia('1')).resolves.toEqual({
      id: '1',
      filePath: '/tmp/does-not-exist.png',
    });
    expect(mediaRepository.delete).toHaveBeenCalledWith('1');
  });
});
