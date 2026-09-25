import { NotificationsService } from './notifications.service.js';

export class NotificationsController {
  static async getNotifications(req, res, next) {
    try {
      const data = await NotificationsService.getNotifications(req.query);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncReminders(req, res, next) {
    try {
      const result = await NotificationsService.syncReminders();
      res.json({
        success: true,
        message: `Reminders synchronized successfully. Created ${result.newNotificationsCreated} new alerts.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      await NotificationsService.markAsRead(req.params.id);
      res.json({
        success: true,
        message: 'Notification marked as read.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationsService.markAllAsRead();
      res.json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req, res, next) {
    try {
      await NotificationsService.deleteNotification(req.params.id);
      res.json({
        success: true,
        message: 'Notification removed.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationsController;
