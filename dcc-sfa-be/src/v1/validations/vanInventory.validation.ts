import { body } from 'express-validator';

export const createVanInventoryValidation = [
  body('user_id').isInt().withMessage('User ID is required'),
  body('product_id').isInt().withMessage('Product ID is required'),
  body('batch_id')
    .optional()
    .custom(value => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      return Number.isInteger(Number(value));
    })
    .withMessage('Batch ID must be an integer'),
  body('serial_no_id')
    .optional()
    .custom(value => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      return Number.isInteger(Number(value));
    })
    .withMessage('Serial No ID must be an integer'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  body('reserved_quantity')
    .isInt()
    .withMessage('Reserved Quantity must be an integer'),
  body('available_quantity')
    .isInt()
    .withMessage('Available Quantity must be an integer'),
  body('vehicle_id')
    .optional()
    .custom(value => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      return Number.isInteger(Number(value));
    })
    .withMessage('Vehicle ID must be an integer'),
  body('location_type')
    .optional()
    .isString()
    .withMessage('Location Type must be a string'),
  body('location_id')
    .optional()
    .isInt()
    .withMessage('Location ID must be an integer'),
  body('is_active').isString().withMessage('Is Active must be a string'),
];
