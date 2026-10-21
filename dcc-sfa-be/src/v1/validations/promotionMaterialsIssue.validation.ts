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
    .optional({ nullable: true })
    .isString()
    .withMessage('Campaign reference must be a string'),

  body('notes')
    .optional({ nullable: true })
    .isString()
    .withMessage('Notes must be a string'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.material_id')
    .notEmpty()
    .withMessage('Item Material is required')
    .isInt()
    .withMessage('Item Material must be a valid integer'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Item quantity is required')
    .isFloat({ min: 0.01 })
    .withMessage('Item quantity must be greater than 0'),

  body('items.*.unit_value')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Unit value must be a valid number'),

  body('items.*.total_value')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Total value must be a valid number'),
];

export const updatePromotionMaterialsIssueValidation = [
  body('depot_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Depot must be a valid integer'),

  body('outlet_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Outlet must be a valid integer'),

  body('issue_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Issue Date must be a valid date'),

  body('issued_by_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Issued By must be a valid integer'),

  body('campaign_reference')
    .optional({ nullable: true })
    .isString()
    .withMessage('Campaign reference must be a string'),

  body('notes')
    .optional({ nullable: true })
    .isString()
    .withMessage('Notes must be a string'),

  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),

  body('items.*.material_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Item Material must be a valid integer'),

  body('items.*.quantity')
    .optional({ nullable: true })
    .isFloat({ min: 0.01 })
    .withMessage('Item quantity must be greater than 0'),

  body('items.*.unit_value')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Unit value must be a valid number'),

  body('items.*.total_value')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Total value must be a valid number'),
];
