import { body } from 'express-validator';

export const createUserValidation = [
  body('username')
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('email').isEmail().withMessage('Enter a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('name').notEmpty().withMessage('Name is required'),

  body('role')
    .optional()
    .isIn(['admin', 'user', 'manager'])
    .withMessage('Role must be admin, user or manager'),

  body('parent_id')
    .isInt()
    .withMessage('Parent company id is required and must be a number'),
];
export const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('email').optional().isEmail().withMessage('Enter a valid email'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'user', 'manager'])
    .withMessage('Role must be admin, user or manager'),
];
