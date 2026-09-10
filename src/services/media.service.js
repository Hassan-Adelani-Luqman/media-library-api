import fs from 'node:fs/promises';
import { mediaRepository } from '../repositories/media.repository.js';
import { createMediaRecord } from '../models/media.model.js';
import { parseTags } from '../utils/parseTags.js';
import { AppError } from '../utils/AppError.js';

export const mediaService = {
  async createMedia(fileMeta, body) {
    const record = createMediaRecord({
      ...fileMeta,
      title: body.title,
      tags: parseTags(body.tags),
      category: body.category,
    });
    return mediaRepository.create(record);
  },

  async getMediaById(id) {
    const media = await mediaRepository.findById(id);
    if (!media) throw new AppError('Media not found', 404);
    return media;
  },

  async listMedia({ page, limit, category, tags, search, sortBy, order }) {
    const filters = { category, tags: parseTags(tags), search };
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      mediaRepository.find(filters, { skip, limit, sortBy, order }),
      mediaRepository.countByFilter(filters),
    ]);

    return {
      results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  },

  async updateMedia(id, body) {
    const existing = await mediaRepository.findById(id);
    if (!existing) throw new AppError('Media not found', 404);

    const updates = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.category !== undefined) updates.category = body.category;
    if (body.tags !== undefined) updates.tags = parseTags(body.tags);

    return mediaRepository.update(id, updates);
  },

  async deleteMedia(id) {
    const existing = await mediaRepository.findById(id);
    if (!existing) throw new AppError('Media not found', 404);

    await mediaRepository.delete(id);
    await fs.unlink(existing.filePath).catch(() => {});

    return existing;
  },
};
