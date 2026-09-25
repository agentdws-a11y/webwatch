import { query } from '../../database/connection.js';
import { WebsitesService } from '../websites/websites.service.js';
import { EXPIRY_STATUS } from '../../config/constants.js';

export class DashboardService {
  /**
   * Get high-level summary KPIs and metrics for dashboard
   */
  static async getSummary() {
    // 1. Fetch all active websites with their computed health
    const { websites: activeWebsites } = await WebsitesService.getAllWebsites({ is_archived: false, limit: 1000 });
    const { websites: archivedWebsites } = await WebsitesService.getAllWebsites({ is_archived: true, limit: 1000 });

    const totalActive = activeWebsites.length;
    const totalArchived = archivedWebsites.length;

    let safeCount = 0;
    let warningCount = 0;
    let expiredCount = 0;

    const expiringSoonList = [];
    const expiredList = [];
    const techDistribution = {};

    activeWebsites.forEach((site) => {
      // Tech distribution
      const tech = site.technology || 'Other';
      techDistribution[tech] = (techDistribution[tech] || 0) + 1;

      // Status aggregation
      if (site.health.overallStatus === EXPIRY_STATUS.EXPIRED) {
        expiredCount++;
        expiredList.push(site);
      } else if (site.health.overallStatus === EXPIRY_STATUS.WARNING) {
        warningCount++;
        expiringSoonList.push(site);
      } else {
        safeCount++;
      }
    });

    // 2. Maintained this month count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const maintainedResult = await query(
      `SELECT COUNT(DISTINCT website_id) AS count 
       FROM maintenance_logs 
       WHERE performed_at >= ?`,
      [startOfMonth.toISOString()]
    );

    const maintainedThisMonth = parseInt(maintainedResult.rows[0]?.count || 0, 10);

    // 3. Total Clients
    const clientsResult = await query(`SELECT COUNT(*) AS count FROM clients`);
    const totalClients = parseInt(clientsResult.rows[0]?.count || 0, 10);

    return {
      overview: {
        totalWebsites: totalActive,
        totalArchived,
        totalClients,
        safeCount,
        warningCount,
        expiredCount,
        maintainedThisMonth,
      },
      technologyDistribution: techDistribution,
      criticalAlerts: {
        expired: expiredList.slice(0, 10),
        expiringSoon: expiringSoonList.slice(0, 10),
      },
    };
  }
}

export default DashboardService;
