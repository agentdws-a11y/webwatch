import { query } from '../../database/connection.js';
import { WebsitesService } from '../websites/websites.service.js';
import { EXPIRY_STATUS } from '../../config/constants.js';

export class NotificationsService {
  /**
   * Get all notifications with optional unread filter
   */
  static async getNotifications(filters = {}) {
    const { unread_only = false, limit = 50 } = filters;
    let sql = `
      SELECT 
        n.*,
        w.website_name,
        w.website_url,
        w.technology,
        c.name AS client_name
      FROM notifications n
      LEFT JOIN websites w ON n.website_id = w.id
      LEFT JOIN clients c ON w.client_id = c.id
    `;
    const params = [];

    if (unread_only === 'true' || unread_only === true) {
      sql += ` WHERE n.is_read = FALSE`;
    }

    sql += ` ORDER BY n.created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10) || 50);

    const result = await query(sql, params);

    // Unread count
    const unreadResult = await query(
      `SELECT COUNT(*) AS count FROM notifications WHERE is_read = FALSE`
    );
    const unreadCount = parseInt(unreadResult.rows[0]?.count || 0, 10);

    return {
      notifications: result.rows.map((row) => ({
        ...row,
        is_read: !!row.is_read,
      })),
      unreadCount,
    };
  }

  /**
   * Scan active websites and synchronize automated reminders (30, 15, 7, 0 days)
   */
  static async syncReminders() {
    const { websites } = await WebsitesService.getAllWebsites({ is_archived: false, limit: 1000 });
    let createdCount = 0;

    for (const site of websites) {
      const services = [
        { name: 'Hosting', data: site.hosting, key: 'hosting' },
        { name: 'Domain', data: site.domain, key: 'domain' },
        { name: 'SSL Certificate', data: site.ssl, key: 'ssl' },
        { name: 'Business Email', data: site.email_cdn?.email_status, key: 'business_email' },
        { name: 'CDN', data: site.email_cdn?.cdn_status, key: 'cdn' },
      ];

      for (const s of services) {
        if (!s.data || s.data.daysRemaining === null || s.data.daysRemaining === undefined) continue;

        const days = s.data.daysRemaining;
        const targetDate = s.data.date;

        let shouldAlert = false;
        let title = '';
        let message = '';

        if (days < 0) {
          shouldAlert = true;
          title = `🔴 Critical: ${s.name} Expired (${Math.abs(days)}d ago)`;
          message = `${s.name} for "${site.website_name}" has expired! Immediate renewal action is required.`;
        } else if (days === 0) {
          shouldAlert = true;
          title = `🚨 Urgent: ${s.name} Expires Today!`;
          message = `${s.name} for "${site.website_name}" is expiring today!`;
        } else if (days <= 7) {
          shouldAlert = true;
          title = `🟡 Warning: ${s.name} Expiring in ${days} Days`;
          message = `${s.name} for "${site.website_name}" will expire in ${days} day(s) on ${targetDate}.`;
        } else if (days <= 15) {
          shouldAlert = true;
          title = `🟡 Reminder: ${s.name} Due in ${days} Days`;
          message = `${s.name} for "${site.website_name}" is due for renewal on ${targetDate}.`;
        } else if (days <= 30) {
          shouldAlert = true;
          title = `ℹ️ Notice: ${s.name} Expiring in ${days} Days`;
          message = `${s.name} renewal for "${site.website_name}" is approaching in ${days} days.`;
        }

        if (shouldAlert) {
          // Check if notification already exists for this site, service, and target_date
          const existing = await query(
            `SELECT id FROM notifications 
             WHERE website_id = ? AND service_type = ? AND target_date = ?`,
            [site.id, s.key, targetDate]
          );

          if (existing.rowCount === 0) {
            await query(
              `INSERT INTO notifications (website_id, service_type, title, message, target_date, is_read, delivery_status)
               VALUES (?, ?, ?, ?, ?, FALSE, 'delivered')`,
              [site.id, s.key, title, message, targetDate]
            );
            createdCount++;
          }
        }
      }
    }

    return { synchronized: true, newNotificationsCreated: createdCount };
  }

  /**
   * Mark single notification as read
   */
  static async markAsRead(id) {
    await query(`UPDATE notifications SET is_read = TRUE WHERE id = ?`, [id]);
    return true;
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead() {
    await query(`UPDATE notifications SET is_read = TRUE`);
    return true;
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id) {
    await query(`DELETE FROM notifications WHERE id = ?`, [id]);
    return true;
  }
}

export default NotificationsService;
