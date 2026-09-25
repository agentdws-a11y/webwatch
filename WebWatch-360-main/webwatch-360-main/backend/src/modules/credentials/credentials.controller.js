import { CredentialsService } from './credentials.service.js';

export class CredentialsController {
  static async getCredentials(req, res, next) {
    try {
      const data = await CredentialsService.getCredentials(req.query.website_id);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCredential(req, res, next) {
    try {
      const result = await CredentialsService.createCredential(req.body);
      res.status(201).json({
        success: true,
        message: 'Credential saved securely to vault with AES-256 encryption.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCredential(req, res, next) {
    try {
      await CredentialsService.updateCredential(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Credential updated securely.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCredential(req, res, next) {
    try {
      await CredentialsService.deleteCredential(req.params.id);
      res.json({
        success: true,
        message: 'Credential removed from vault.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CredentialsController;
