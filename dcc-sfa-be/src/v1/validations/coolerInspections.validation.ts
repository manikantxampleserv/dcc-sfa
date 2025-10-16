import { body } from 'express-validator';

export const createCoolerInspectionValidation = [
  body('cooler_id')
    .notEmpty()
    .withMessage('Cooler ID is required')
    .isInt({ min: 1 })
    .withMessage('Cooler ID must be a positive integer'),

  body('inspected_by')
    .notEmpty()
    .withMessage('Inspector ID is required')
    .isInt({ min: 1 })
    .withMessage('Inspector ID must be a positive integer'),

  body('visit_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Visit ID must be a positive integer'),

  body('inspection_date')
    .optional()
    .isISO8601()
    .withMessage('Inspection date must be a valid date'),

  body('temperature')
    .optional()
    .isDecimal()
    .withMessage('Temperature must be a decimal number'),

  body('is_working')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_working must be Y or N'),

  body('issues')
    .optional()
    .isString()
    .withMessage('Issues must be a string')
    .isLength({ max: 2000 })
    .withMessage('Issues must be less than 2000 characters'),

  body('images')
    .optional()
    .isString()
    .withMessage('Images must be a string')
    .isLength({ max: 2000 })
    .withMessage('Images must be less than 2000 characters'),

  body('latitude')
    .optional()
    .isDecimal()
    .withMessage('Latitude must be a decimal number'),

  body('longitude')
    .optional()
    .isDecimal()
    .withMessage('Longitude must be a decimal number'),

  body('action_required')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('action_required must be Y or N'),

  body('action_taken')
    .optional()
    .isString()
    .withMessage('Action taken must be a string')
    .isLength({ max: 2000 })
    .withMessage('Action taken must be less than 2000 characters'),

  body('next_inspection_due')
    .optional()
    .isISO8601()
    .withMessage('Next inspection due must be a valid date'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
