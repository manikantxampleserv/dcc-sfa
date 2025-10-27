import { body } from 'express-validator';

export const createCustomerAssetValidation = [
  body('customer_id').isInt().withMessage('Customer ID must be an integer'),
  body('asset_type_id').isInt().withMessage('Asset Type ID must be an integer'),
  body('brand_id')
    .optional()
    .isInt()
    .withMessage('Brand ID must be an integer'),
  body('model').optional().isString().withMessage('Model must be a string'),
  body('serial_number')
    .optional()
    .isString()
    .withMessage('Serial Number must be a string'),
  body('capacity')
    .optional()
    .isInt()
    .withMessage('Capacity must be an integer'),
  body('install_date')
    .optional()
    .isDate()
    .withMessage('Install Date must be a date'),
  body('status').optional().isString().withMessage('Status must be a string'),
  body('last_scanned_date')
    .optional()
    .isDate()
    .withMessage('Last Scanned Date must be a date'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
  body('technician_id')
    .optional()
    .isInt()
    .withMessage('Technician ID must be an integer'),
  body('warranty_expiry')
    .optional()
    .isDate()
    .withMessage('Warranty Expiry must be a date'),
  body('maintenance_contract')
    .optional()
    .isString()
    .withMessage('Maintenance Contract must be a string'),
  body('is_active')
    .optional()
    .isString()
    .withMessage('Is Active must be a string'),
];
