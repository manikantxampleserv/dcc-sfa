import { body } from 'express-validator';

export const createStockMovementValidation = [
  body('product_id')
    .notEmpty()
    .withMessage('Product ID is required')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('batch_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Batch ID must be a positive integer'),

  body('serial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Serial ID must be a positive integer'),

  body('movement_type')
    .notEmpty()
    .withMessage('Movement type is required')
    .isString()
    .withMessage('Movement type must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Movement type must be between 2 and 50 characters'),

  body('reference_type')
    .optional()
    .isString()
    .withMessage('Reference type must be a string')
    .isLength({ max: 50 })
    .withMessage('Reference type must be less than 50 characters'),

  body('reference_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Reference ID must be a positive integer'),

  body('from_location_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('From location ID must be a positive integer'),

  body('to_location_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('To location ID must be a positive integer')
    .custom((value, { req }) => {
      if (
        value &&
        req.body.from_location_id &&
        value === req.body.from_location_id
      ) {
        throw new Error('From location and To location cannot be the same');
      }
      return true;
    }),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('movement_date')
    .optional()
    .isISO8601()
    .withMessage('Movement date must be a valid date'),

  body('remarks')
    .optional()
    .isString()
    .withMessage('Remarks must be a string')
    .isLength({ max: 1000 })
    .withMessage('Remarks must be less than 1000 characters'),

  body('van_inventory_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Van inventory ID must be a positive integer'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is active must be Y or N'),
];

export const updateStockMovementValidation = [
  body('product_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('batch_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Batch ID must be a positive integer'),

  body('serial_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Serial ID must be a positive integer'),

  body('movement_type')
    .optional()
    .isString()
    .withMessage('Movement type must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Movement type must be between 2 and 50 characters'),

  body('reference_type')
    .optional()
    .isString()
    .withMessage('Reference type must be a string')
    .isLength({ max: 50 })
    .withMessage('Reference type must be less than 50 characters'),

  body('reference_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Reference ID must be a positive integer'),

  body('from_location_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('From location ID must be a positive integer'),

  body('to_location_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('To location ID must be a positive integer')
    .custom((value, { req }) => {
      if (
        value &&
        req.body.from_location_id &&
        value === req.body.from_location_id
      ) {
        throw new Error('From location and To location cannot be the same');
      }
      return true;
    }),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('movement_date')
    .optional()
    .isISO8601()
    .withMessage('Movement date must be a valid date'),

  body('remarks')
    .optional()
    .isString()
    .withMessage('Remarks must be a string')
    .isLength({ max: 1000 })
    .withMessage('Remarks must be less than 1000 characters'),

  body('van_inventory_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Van inventory ID must be a positive integer'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is active must be Y or N'),
];
