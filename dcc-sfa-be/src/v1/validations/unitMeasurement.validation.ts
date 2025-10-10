import { body } from 'express-validator';

export const unitMeasurementValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional(),
  body('category').optional(),
  body('symbol').optional(),
  body('is_active').optional(),
];
