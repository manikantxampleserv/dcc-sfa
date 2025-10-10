import { body } from 'express-validator';

export const createCurrenciesValidation = [
  body('name').notEmpty().isString().withMessage('Name is required'),
  body('code').notEmpty().isString().withMessage('Code is required'),
  body('symbol').optional().isString().withMessage('Symbol must be a string'),
  body('is_active').notEmpty().isString().withMessage('Is active is required'),
];
