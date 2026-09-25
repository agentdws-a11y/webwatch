import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../database/connection.js';
import { errorResponse } from '../utils/response.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or invalid format.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const userResult = await query(
      `SELECT id, name, email, created_at FROM users WHERE id = ?`,
      [decoded.userId]
    );

    if (userResult.rowCount === 0) {
      return errorResponse(res, 'Authenticated user no longer exists.', 401);
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session token expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
}

export default authenticate;
