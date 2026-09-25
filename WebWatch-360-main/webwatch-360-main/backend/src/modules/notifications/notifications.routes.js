import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// All notifications routes are protected
router.use(authenticate);

router.get('/', NotificationsController.getNotifications);
router.post('/sync', NotificationsController.syncReminders);
router.patch('/mark-all-read', NotificationsController.markAllAsRead);
router.patch('/:id/read', NotificationsController.markAsRead);
router.delete('/:id', NotificationsController.deleteNotification);

export default router;
