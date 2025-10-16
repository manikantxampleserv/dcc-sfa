import { body } from 'express-validator';

export const createCoolerInstallationValidation = [
  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),

  body('code')
    .notEmpty()
    .withMessage('Cooler code is required')
    .isString()
    .withMessage('Cooler code must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Cooler code must be between 2 and 50 characters'),

  body('brand')
    .optional()
    .isString()
    .withMessage('Brand must be a string')
    .isLength({ max: 100 })
    .withMessage('Brand must be less than 100 characters'),

  body('model')
    .optional()
    .isString()
    .withMessage('Model must be a string')
    .isLength({ max: 100 })
    .withMessage('Model must be less than 100 characters'),

  body('serial_number')
    .optional()
    .isString()
    .withMessage('Serial number must be a string')
    .isLength({ max: 100 })
    .withMessage('Serial number must be less than 100 characters'),

  body('capacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Capacity must be a non-negative integer'),

  body('install_date')
    .optional()
    .isISO8601()
    .withMessage('Install date must be a valid date'),

  body('last_service_date')
    .optional()
    .isISO8601()
    .withMessage('Last service date must be a valid date'),

  body('next_service_due')
    .optional()
    .isISO8601()
    .withMessage('Next service due must be a valid date'),

  body('status')
    .optional()
    .isString()
    .withMessage('Status must be a string')
    .isLength({ max: 20 })
    .withMessage('Status must be less than 20 characters'),

  body('temperature')
    .optional()
    .isDecimal()
    .withMessage('Temperature must be a decimal number'),

  body('energy_rating')
    .optional()
    .isString()
    .withMessage('Energy rating must be a string')
    .isLength({ max: 10 })
    .withMessage('Energy rating must be less than 10 characters'),

  body('warranty_expiry')
    .optional()
    .isISO8601()
    .withMessage('Warranty expiry must be a valid date'),

  body('maintenance_contract')
    .optional()
    .isString()
    .withMessage('Maintenance contract must be a string')
    .isLength({ max: 100 })
    .withMessage('Maintenance contract must be less than 100 characters'),

  body('technician_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Technician ID must be a positive integer'),

  body('last_scanned_date')
    .optional()
    .isISO8601()
    .withMessage('Last scanned date must be a valid date'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
