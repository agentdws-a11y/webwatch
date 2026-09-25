import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { loginValidation, changePasswordValidation } from './auth.validation.js';
import { validate } from '../../middlewares/errorHandler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', loginValidation, validate, AuthController.login);

// Protected routes
router.get('/me', authenticate, AuthController.me);
router.post('/change-password', authenticate, changePasswordValidation, validate, AuthController.changePassword);

export default router;
