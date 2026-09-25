import { Router } from 'express';
import { ClientsController } from './clients.controller.js';
import { createClientValidation, updateClientValidation } from './clients.validation.js';
import { validate } from '../../middlewares/errorHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// All client endpoints require authentication
router.use(authenticate);

router.get('/', ClientsController.getAll);
router.get('/:id', ClientsController.getById);
router.post('/', createClientValidation, validate, ClientsController.create);
router.put('/:id', updateClientValidation, validate, ClientsController.update);
router.delete('/:id', ClientsController.delete);

export default router;
