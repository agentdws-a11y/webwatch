import { AuthService } from './auth.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return successResponse(res, result, 'Login successful.');
    } catch (error) {
      return errorResponse(res, error.message, 401);
    }
  }

  static async me(req, res, next) {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      return successResponse(res, profile, 'User profile retrieved.');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      return successResponse(res, null, 'Password updated successfully.');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default AuthController;
