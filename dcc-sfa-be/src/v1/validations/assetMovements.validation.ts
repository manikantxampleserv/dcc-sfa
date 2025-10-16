import { body } from 'express-validator';

export const createAssetMovementsValidation = [
  body('asset_id').isInt().withMessage('Asset ID is required'),
  body('performed_by').isInt().withMessage('Performed By is required'),
  body('from_location').isString().withMessage('From Location is required'),
  body('to_location').isString().withMessage('To Location is required'),
  body('movement_type').isString().withMessage('Movement Type is required'),
  body('movement_date').isDate().withMessage('Movement Date is required'),
  body('notes').isString().withMessage('Notes is required'),
  body('is_active').isString().withMessage('Is Active is required'),
];
