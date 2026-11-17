/**
 * @fileoverview Asset Maintenance Validations
 * @description Validation rules for asset maintenance endpoints
 */

import { body } from 'express-validator';

export const createAssetMaintenanceValidation = [
  body('asset_id').isInt().withMessage('Asset ID must be an integer'),
  body('technician_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt()
    .withMessage('Technician ID must be an integer'),
  body('maintenance_date')
    .isDate()
    .withMessage('Maintenance date must be a valid date'),
  body('issue_reported')
    .optional({ nullable: true })
    .isString()
    .withMessage('Issue reported must be a string'),
  body('action_taken')
    .optional({ nullable: true })
    .isString()
    .withMessage('Action taken must be a string'),
  body('cost')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('remarks')
    .optional({ nullable: true })
    .isString()
    .withMessage('Remarks must be a string'),
  body('status')
    .optional({ nullable: true })
    .isString()
    .withMessage('Status must be a string'),
  body('repair_location')
    .optional({ nullable: true })
    .isString()
    .withMessage('Repair location must be a string'),
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
