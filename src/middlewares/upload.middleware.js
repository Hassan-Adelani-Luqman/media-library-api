import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

const uploadDir = path.join(process.cwd(), config.uploadDir);

try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  // Vercel's filesystem is read-only outside /tmp — see docs/vercel-deployment.md.
  logger.warn('Could not create upload directory', { uploadDir, reason: err.message });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Unsupported file type. Only JPEG, PNG, and PDF files are allowed', 400));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSizeBytes },
});
