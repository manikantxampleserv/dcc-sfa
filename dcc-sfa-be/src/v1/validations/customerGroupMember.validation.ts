import { body } from 'express-validator';

export const createCustomerGroupMemberValidation = [
  body('customer_group_id')
    .notEmpty()
    .withMessage('Customer group ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer group ID must be a positive integer'),

  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),

  body('joined_at')
    .optional()
    .isISO8601()
    .withMessage('joined_at must be a valid ISO date'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be either "Y" or "N"'),
];
