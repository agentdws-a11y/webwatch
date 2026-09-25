import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// All maintenance routes are protected
router.use(authenticate);

router.get('/logs', MaintenanceController.getLogs);
router.post('/logs', MaintenanceController.createLog);
router.delete('/logs/:id', MaintenanceController.deleteLog);

export default router;
