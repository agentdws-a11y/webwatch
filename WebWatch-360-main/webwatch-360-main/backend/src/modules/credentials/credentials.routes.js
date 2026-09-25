import { Router } from 'express';
import { CredentialsController } from './credentials.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// All credentials vault routes are strictly protected behind admin authentication
router.use(authenticate);

router.get('/', CredentialsController.getCredentials);
router.post('/', CredentialsController.createCredential);
router.put('/:id', CredentialsController.updateCredential);
router.delete('/:id', CredentialsController.deleteCredential);

export default router;
