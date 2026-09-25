import { WebsitesService } from './websites.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class WebsitesController {
  static async getAll(req, res) {
    try {
      const filters = {
        search: req.query.search,
        client_id: req.query.client_id ? parseInt(req.query.client_id, 10) : undefined,
        technology: req.query.technology,
        priority: req.query.priority,
        status: req.query.status,
        is_archived: req.query.is_archived === 'true',
        tag: req.query.tag,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order,
        page: req.query.page || 1,
        limit: req.query.limit || 50,
      };

      const data = await WebsitesService.getAllWebsites(filters);
      return successResponse(res, data, 'Websites retrieved successfully.');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getById(req, res) {
    try {
      const website = await WebsitesService.getWebsiteById(req.params.id);
      return successResponse(res, website, 'Website details retrieved.');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async create(req, res) {
    try {
      const website = await WebsitesService.createWebsite(req.body);
      return successResponse(res, website, 'Website created successfully.', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const website = await WebsitesService.updateWebsite(req.params.id, req.body);
      return successResponse(res, website, 'Website updated successfully.');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async archive(req, res) {
    try {
      const result = await WebsitesService.archiveWebsite(req.params.id);
      return successResponse(res, result, 'Website archived successfully.');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async restore(req, res) {
    try {
      const result = await WebsitesService.restoreWebsite(req.params.id);
      return successResponse(res, result, 'Website restored from archive.');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await WebsitesService.deleteWebsite(req.params.id);
      return successResponse(res, null, 'Website permanently deleted.');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default WebsitesController;
