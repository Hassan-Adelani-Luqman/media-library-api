import { z } from 'zod';
import { CATEGORIES } from '../models/media.model.js';

const categoryField = z.enum(CATEGORIES, {
  error: `Category must be one of: ${CATEGORIES.join(', ')}`,
});

const tagsField = z.union([z.string(), z.array(z.string())]);

export const createMediaSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    tags: tagsField.optional(),
    category: categoryField,
  }),
});

export const updateMediaSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'id is required'),
  }),
  body: z
    .object({
      title: z.string().trim().min(1, 'Title cannot be empty').optional(),
      tags: tagsField.optional(),
      category: categoryField.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const getMediaByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'id is required'),
  }),
});

export const getMediaListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
    category: categoryField.optional(),
    tags: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'fileSize', 'category']).optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
