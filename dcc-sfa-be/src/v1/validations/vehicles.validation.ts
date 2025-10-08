import { body } from 'express-validator';

export const createVehicleValidation = [
  body('vehicle_number')
    .notEmpty()
    .withMessage('Vehicle number is required')
    .isString()
    .withMessage('Vehicle number must be a string')
    .isLength({ max: 20 })
    .withMessage('Vehicle number must be less than 20 characters'),

  body('type')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isString()
    .withMessage('Type must be a string')
    .isLength({ max: 20 })
    .withMessage('Type must be less than 20 characters'),

  body('make')
    .optional()
    .isString()
    .withMessage('Make must be a string')
    .isLength({ max: 50 })
    .withMessage('Make must be less than 50 characters'),

  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string')
    .isLength({ max: 50 })
    .withMessage('Model must be less than 50 characters'),

  body('year')
    .optional()
    .isInt({ min: 1900, max: 2100 })
    .withMessage('Year must be between 1900 and 2100'),

  body('capacity')
    .optional()
    .isDecimal()
    .withMessage('Capacity must be a decimal number'),

  body('fuel_type')
    .optional()
    .isString()
    .withMessage('Fuel type must be a string')
    .isLength({ max: 20 })
    .withMessage('Fuel type must be less than 20 characters'),

  body('status')
    .optional()
    .isString()
    .withMessage('Status must be a string')
    .isLength({ max: 20 })
    .withMessage('Status must be less than 20 characters'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
