import { body, param } from 'express-validator';

export const createClientValidation = [
  body('name').trim().notEmpty().withMessage('Client name is required.'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email address is required.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).isString().trim(),
  body('company').optional({ checkFalsy: true }).isString().trim(),
  body('notes').optional().isString(),
];

export const updateClientValidation = [
  param('id').isInt().withMessage('Valid client ID is required.'),
  body('name').optional().trim().notEmpty().withMessage('Client name cannot be empty.'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email address is required.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).isString().trim(),
  body('company').optional({ checkFalsy: true }).isString().trim(),
  body('notes').optional().isString(),
];

export default { createClientValidation, updateClientValidation };
