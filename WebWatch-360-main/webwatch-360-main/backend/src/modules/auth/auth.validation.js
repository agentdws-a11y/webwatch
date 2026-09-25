import { body } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email address is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long.'),
];

export default { loginValidation, changePasswordValidation };
