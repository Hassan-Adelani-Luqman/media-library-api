import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import {
  createMediaSchema,
  updateMediaSchema,
  getMediaByIdSchema,
  getMediaListSchema,
} from '../validations/media.validation.js';

const router = Router();

router.post('/', upload.single('file'), validate(createMediaSchema), mediaController.createMedia);
router.get('/', validate(getMediaListSchema), mediaController.getAll);
router.get('/:id', validate(getMediaByIdSchema), mediaController.getById);
router.put('/:id', validate(updateMediaSchema), mediaController.update);
router.delete('/:id', validate(getMediaByIdSchema), mediaController.remove);

export default router;
