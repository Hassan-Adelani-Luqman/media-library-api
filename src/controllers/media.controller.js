import { mediaService } from '../services/media.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

export const mediaController = {
  createMedia: catchAsync(async (req, res) => {
    if (!req.file) throw new AppError('A file is required', 400);

    const fileMeta = {
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    };

    const media = await mediaService.createMedia(fileMeta, req.validated.body);
    logger.info('File uploaded', { id: media.id, originalName: media.originalName, fileSize: media.fileSize });
    res.status(201).json({ status: 'success', data: media });
  }),

  getAll: catchAsync(async (req, res) => {
    const data = await mediaService.listMedia(req.validated.query);
    res.status(200).json({ status: 'success', data });
  }),

  getById: catchAsync(async (req, res) => {
    const media = await mediaService.getMediaById(req.validated.params.id);
    res.status(200).json({ status: 'success', data: media });
  }),

  update: catchAsync(async (req, res) => {
    const media = await mediaService.updateMedia(req.validated.params.id, req.validated.body);
    res.status(200).json({ status: 'success', data: media });
  }),

  remove: catchAsync(async (req, res) => {
    await mediaService.deleteMedia(req.validated.params.id);
    res.status(200).json({ status: 'success', data: null });
  }),
};
