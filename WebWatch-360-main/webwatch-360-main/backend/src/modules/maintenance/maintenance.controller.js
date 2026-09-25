import { MaintenanceService } from './maintenance.service.js';

export class MaintenanceController {
  static async getLogs(req, res, next) {
    try {
      const result = await MaintenanceService.getLogs(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createLog(req, res, next) {
    try {
      const log = await MaintenanceService.createLog(req.body);
      res.status(201).json({
        success: true,
        message: 'Maintenance task logged successfully.',
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLog(req, res, next) {
    try {
      await MaintenanceService.deleteLog(req.params.id);
      res.json({
        success: true,
        message: 'Maintenance log removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MaintenanceController;
