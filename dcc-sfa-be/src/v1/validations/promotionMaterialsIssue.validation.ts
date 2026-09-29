import { body } from 'express-validator';

export const createPromotionMaterialsIssueValidation = [
  body('depot_id')
    .notEmpty()
    .withMessage('Depot is required')
    .isInt()
    .withMessage('Depot must be a valid integer'),

  body('outlet_id')
    .notEmpty()
    .withMessage('Outlet is required')
    .isInt()
    .withMessage('Outlet must be a valid integer'),

  body('issue_date')
    .notEmpty()
    .withMessage('Issue Date is required')
    .isISO8601()
    .withMessage('Issue Date must be a valid date'),

  body('issued_by_id')
    .notEmpty()
    .withMessage('Issued By is required')
    .isInt()
    .withMessage('Issued By must be a valid integer'),

  body('campaign_reference')
    .optional()
    .isString()
    .withMessage('Campaign reference must be a string'),

  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.asset_id')
    .notEmpty()
    .withMessage('Item Asset is required')
    .isInt()
    .withMessage('Item Asset must be a valid integer'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Item quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Item quantity must be greater than 0'),

  body('items.*.unit_value')
    .optional()
    .isNumeric()
    .withMessage('Unit value must be a valid number'),

  body('items.*.total_value')
    .optional()
    .isNumeric()
    .withMessage('Total value must be a valid number'),
];

export const updatePromotionMaterialsIssueValidation = [
  body('depot_id')
    .optional()
    .isInt()
    .withMessage('Depot must be a valid integer'),

  body('outlet_id')
    .optional()
    .isInt()
    .withMessage('Outlet must be a valid integer'),

  body('issue_date')
    .optional()
    .isISO8601()
    .withMessage('Issue Date must be a valid date'),

  body('issued_by_id')
    .optional()
    .isInt()
    .withMessage('Issued By must be a valid integer'),

  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),

  body('items.*.asset_id')
    .optional()
    .isInt()
    .withMessage('Item Asset must be a valid integer'),

  body('items.*.quantity')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Item quantity must be greater than 0'),
];
