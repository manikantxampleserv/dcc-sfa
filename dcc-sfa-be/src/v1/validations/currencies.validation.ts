import { body } from 'express-validator';

export const createCurrenciesValidation = [
  body('name').notEmpty().isString().withMessage('Name is required'),
  body('symbol').notEmpty().isString().withMessage('Symbol is required'),
  body('is_active').notEmpty().isString().withMessage('Is active is required'),
];
