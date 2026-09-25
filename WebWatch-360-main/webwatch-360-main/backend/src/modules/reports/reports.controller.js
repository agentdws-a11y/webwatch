import { ReportsService } from './reports.service.js';

export class ReportsController {
  static async getSummary(req, res, next) {
    try {
      const data = await ReportsService.getSummaryReport();
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ReportsController;
