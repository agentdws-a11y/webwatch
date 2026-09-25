import { body, param, query } from 'express-validator';

export const createWebsiteValidation = [
  body('website_name').trim().notEmpty().withMessage('Website name is required.'),
  body('website_url').trim().notEmpty().withMessage('Website URL is required.').isURL().withMessage('Please provide a valid website URL.'),
  body('client_id').optional({ checkFalsy: true }).isInt().withMessage('Valid client ID is required.'),
  body('technology').optional().isString().trim(),
  body('hosting_provider').optional().isString().trim(),
  body('domain_provider').optional().isString().trim(),
  body('date_built').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Valid date_built (YYYY-MM-DD) is required.'),
  body('support_plan').optional().isString().trim(),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority level.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
  body('notes').optional().isString(),

  // Hosting
  body('hosting.provider').optional().isString().trim(),
  body('hosting.plan_name').optional().isString().trim(),
  body('hosting.renewal_date').optional({ checkFalsy: true }).isISO8601().withMessage('Valid hosting renewal date is required.'),
  body('hosting.cost').optional().isNumeric().withMessage('Hosting cost must be numeric.'),
  body('hosting.auto_renew').optional().isBoolean(),

  // Domain
  body('domain.registrar').optional().isString().trim(),
  body('domain.expiry_date').optional({ checkFalsy: true }).isISO8601().withMessage('Valid domain expiry date is required.'),
  body('domain.cost').optional().isNumeric().withMessage('Domain cost must be numeric.'),
  body('domain.auto_renew').optional().isBoolean(),

  // SSL
  body('ssl.issuer').optional().isString().trim(),
  body('ssl.expiry_date').optional({ checkFalsy: true }).isISO8601().withMessage('Valid SSL expiry date is required.'),
  body('ssl.ssl_type').optional().isString().trim(),
  body('ssl.auto_renew').optional().isBoolean(),

  // Email & CDN
  body('email_cdn.email_provider').optional().isString().trim(),
  body('email_cdn.email_expiry_date').optional({ checkFalsy: true }).isISO8601().withMessage('Valid business email expiry date is required.'),
  body('email_cdn.cdn_provider').optional().isString().trim(),
  body('email_cdn.cdn_expiry_date').optional({ checkFalsy: true }).isISO8601().withMessage('Valid CDN expiry date is required.'),
];

export const updateWebsiteValidation = [
  param('id').isInt().withMessage('Valid website ID is required.'),
  ...createWebsiteValidation.map((rule) => rule.optional()),
];

export const listWebsitesValidation = [
  query('search').optional().isString(),
  query('client_id').optional().isInt(),
  query('technology').optional().isString(),
  query('priority').optional().isString(),
  query('status').optional().isIn(['safe', 'warning', 'expired', 'all']),
  query('is_archived').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export default { createWebsiteValidation, updateWebsiteValidation, listWebsitesValidation };
