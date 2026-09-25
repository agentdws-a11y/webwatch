import { ClientsService } from './clients.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class ClientsController {
  static async getAll(req, res) {
    try {
      const search = req.query.search || '';
      const clients = await ClientsService.getAllClients(search);
      return successResponse(res, clients, 'Clients retrieved successfully.');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getById(req, res) {
    try {
      const client = await ClientsService.getClientById(req.params.id);
      return successResponse(res, client, 'Client details retrieved.');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async create(req, res) {
    try {
      const client = await ClientsService.createClient(req.body);
      return successResponse(res, client, 'Client created successfully.', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const client = await ClientsService.updateClient(req.params.id, req.body);
      return successResponse(res, client, 'Client updated successfully.');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await ClientsService.deleteClient(req.params.id);
      return successResponse(res, null, 'Client deleted successfully.');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ClientsController;
