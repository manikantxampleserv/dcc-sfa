import { body } from 'express-validator';

export const createAssetMasterValidation = [
  body('asset_type_id')
    .notEmpty()
    .withMessage('Asset type ID is required')
    .isInt({ min: 1 })
    .withMessage('Asset type ID must be a positive integer'),

  body('serial_number')
    .notEmpty()
    .withMessage('Serial number is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial number must be between 1 and 100 characters')
    .matches(/^[A-Za-z0-9\-_]+$/)
    .withMessage(
      'Serial number can only contain letters, numbers, hyphens, and underscores'
    ),

  body('purchase_date')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date (YYYY-MM-DD)'),

  body('warranty_expiry')
    .optional()
    .isISO8601()
    .withMessage('Warranty expiry must be a valid date (YYYY-MM-DD)'),

  body('current_location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Current location must not exceed 255 characters'),

  body('current_status')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Current status must not exceed 50 characters')
    .isIn([
      'Available',
      'In Use',
      'Under Maintenance',
      'Retired',
      'Lost',
      'Damaged',
    ])
    .withMessage(
      'Current status must be one of: Available, In Use, Under Maintenance, Retired, Lost, Damaged'
    ),

  body('assigned_to')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Assigned to must not exceed 100 characters'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateAssetMasterValidation = [
  body('asset_type_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Asset type ID must be a positive integer'),

  body('serial_number')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial number must be between 1 and 100 characters')
    .matches(/^[A-Za-z0-9\-_]+$/)
    .withMessage(
      'Serial number can only contain letters, numbers, hyphens, and underscores'
    ),

  body('purchase_date')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date (YYYY-MM-DD)'),

  body('warranty_expiry')
    .optional()
    .isISO8601()
    .withMessage('Warranty expiry must be a valid date (YYYY-MM-DD)'),

  body('current_location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Current location must not exceed 255 characters'),

  body('current_status')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Current status must not exceed 50 characters')
    .isIn([
      'Available',
      'In Use',
      'Under Maintenance',
      'Retired',
      'Lost',
      'Damaged',
    ])
    .withMessage(
      'Current status must be one of: Available, In Use, Under Maintenance, Retired, Lost, Damaged'
    ),

  body('assigned_to')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Assigned to must not exceed 100 characters'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
