import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';
import { env } from '../config/env.js';

/**
 * Middleware to intercept express-validator validation errors
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed for request payload.', 422, errors.array());
  }
  next();
}

/**
 * 404 Route Not Found Middleware
 */
export function notFoundHandler(req, res) {
  return errorResponse(res, `Endpoint ${req.method} ${req.originalUrl} not found.`, 404);
}

/**
 * Global Error Handler
 */
export function globalErrorHandler(err, req, res, next) {
  console.error('[Global Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    message,
    statusCode,
    env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
}

export default { validate, notFoundHandler, globalErrorHandler };
