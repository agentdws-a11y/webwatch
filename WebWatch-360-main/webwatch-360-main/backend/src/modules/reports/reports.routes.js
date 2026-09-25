import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/summary', ReportsController.getSummary);

export default router;
