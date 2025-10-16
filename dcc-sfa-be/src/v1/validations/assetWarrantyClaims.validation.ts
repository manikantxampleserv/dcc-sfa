import { body } from 'express-validator';

export const createAssetWarrantyClaimsValidation = [
  body('asset_id').isInt().withMessage('asset_id must be an integer'),
  body('claim_date').isDate().withMessage('claim_date must be a date'),
  body('issue_description')
    .optional()
    .isString()
    .withMessage('issue_description must be a string'),
  body('claim_status')
    .optional()
    .isString()
    .withMessage('claim_status must be a string'),
  body('resolved_date')
    .optional()
    .isDate()
    .withMessage('resolved_date must be a date'),
  body('notes').optional().isString().withMessage('notes must be a string'),
  body('is_active')
    .optional()
    .isString()
    .withMessage('is_active must be a string'),
];
