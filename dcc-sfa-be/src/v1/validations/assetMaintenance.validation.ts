import { body } from 'express-validator';

export const createAssetMaintenanceValidation = [
  body('asset_id').isInt().withMessage('Asset ID must be an integer'),
  body('technician_id').isInt().withMessage('Technician ID must be an integer'),
  body('maintenance_date')
    .isDate()
    .withMessage('Maintenance date must be a valid date'),
  body('issue_reported')
    .optional()
    .isString()
    .withMessage('Issue reported must be a string'),
  body('action_taken')
    .optional()
    .isString()
    .withMessage('Action taken must be a string'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
  body('spares').optional().isArray().withMessage('Spares must be an array'),
  body('spares.*.name')
    .optional()
    .isString()
    .withMessage('Spare part name must be a string'),
  body('spares.*.cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Spare part cost must be a non-negative number'),
];
