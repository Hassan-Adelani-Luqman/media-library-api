import crypto from 'node:crypto';

export const CATEGORIES = ['image', 'document', 'design', 'marketing', 'other'];

export function createMediaRecord({ filePath, originalName, mimeType, fileSize, title, tags, category }) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    filePath,
    originalName,
    mimeType,
    fileSize,
    title,
    tags,
    category,
    createdAt: now,
    updatedAt: now,
  };
}
