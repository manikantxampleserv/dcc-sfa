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
  body('cost').optional().isFloat().withMessage('Cost must be a float'),
  body('remarks').optional().isString().withMessage('Remarks must be a string'),
  body('is_active').isBoolean().withMessage('Is active must be a boolean'),
  body('createdby').isInt().withMessage('Created by must be an integer'),
  body('updatedby').isInt().withMessage('Updated by must be an integer'),
  body('log_inst').isInt().withMessage('Log instance must be an integer'),
];
