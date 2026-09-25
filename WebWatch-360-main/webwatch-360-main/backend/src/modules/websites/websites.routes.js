import { Router } from 'express';
import { WebsitesController } from './websites.controller.js';
import {
  createWebsiteValidation,
  updateWebsiteValidation,
  listWebsitesValidation,
} from './websites.validation.js';
import { validate } from '../../middlewares/errorHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// All website operations require authenticated admin
router.use(authenticate);

router.get('/', listWebsitesValidation, validate, WebsitesController.getAll);
router.get('/:id', WebsitesController.getById);
router.post('/', createWebsiteValidation, validate, WebsitesController.create);
router.put('/:id', updateWebsiteValidation, validate, WebsitesController.update);
router.patch('/:id/archive', WebsitesController.archive);
router.patch('/:id/restore', WebsitesController.restore);
router.delete('/:id', WebsitesController.delete);

export default router;
