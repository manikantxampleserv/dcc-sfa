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
];

export const updatePriceListValidation = [...createPriceListsValidation];
