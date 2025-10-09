import { body, param, query } from 'express-validator';

export const createPriceListsValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),

  body('currency_code')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Currency code cannot exceed 10 characters'),

  body('valid_from')
    .optional()
    .isISO8601()
    .withMessage('valid_from must be a valid ISO 8601 date'),

  body('valid_to')
    .optional()
    .isISO8601()
    .withMessage('valid_to must be a valid ISO 8601 date'),
];

export const updatePriceListValidation = [...createPriceListsValidation];
