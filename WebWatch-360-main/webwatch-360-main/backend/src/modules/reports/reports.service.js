import { query } from '../../database/connection.js';
import { WebsitesService } from '../websites/websites.service.js';

export class ReportsService {
  /**
   * Get portfolio health and maintenance summary
   */
  static async getSummaryReport() {
    const { websites } = await WebsitesService.getAllWebsites({ is_archived: false, limit: 1000 });

    const totalSites = websites.length;
    let safeCount = 0;
    let warningCount = 0;
    let expiredCount = 0;
    let totalMonthlyCost = 0;

    websites.forEach((site) => {
      if (site.health.overallStatus === 'safe') safeCount++;
      else if (site.health.overallStatus === 'warning') warningCount++;
      else if (site.health.overallStatus === 'expired') expiredCount++;

      const hostingCost = parseFloat(site.hosting?.cost || 0);
      const domainCost = parseFloat(site.domain?.cost || 0);
      totalMonthlyCost += hostingCost + (domainCost / 12);
    });

    // Fetch maintenance tasks count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const logsResult = await query(
      `SELECT COUNT(*) AS totalLogs, COUNT(DISTINCT website_id) AS distinctSites
       FROM maintenance_logs
       WHERE performed_at >= ?`,
      [startOfMonth.toISOString()]
    );

    return {
      totalSites,
      safeCount,
      warningCount,
      expiredCount,
      estimatedMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      maintenanceThisMonth: {
        totalLogs: parseInt(logsResult.rows[0]?.totalLogs || 0, 10),
        distinctSites: parseInt(logsResult.rows[0]?.distinctSites || 0, 10),
      },
      websites,
    };
  }
}

export default ReportsService;
