import { DashboardService } from './dashboard.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class DashboardController {
  static async getSummary(req, res) {
    try {
      const data = await DashboardService.getSummary();
      return successResponse(res, data, 'Dashboard overview retrieved.');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default DashboardController;
