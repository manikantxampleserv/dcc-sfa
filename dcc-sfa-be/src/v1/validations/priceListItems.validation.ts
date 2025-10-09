import { body, param } from 'express-validator';

export const createPriceListItemsValidation = [
  body('pricelist_id')
    .exists()
    .withMessage('pricelist_id is required')
    .isInt({ gt: 0 })
    .withMessage('pricelist_id must be a positive integer'),
  body('product_id')
    .exists()
    .withMessage('product_id is required')
    .isInt({ gt: 0 })
    .withMessage('product_id must be a positive integer'),
  body('unit_price')
    .exists()
    .withMessage('unit_price is required')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('unit_price must be a decimal with max 2 decimal places'),
  body('uom').optional().isString().withMessage('uom must be a string'),
  body('discount_percent')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('discount_percent must be a decimal'),
  body('effective_from')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('effective_from must be a valid date'),
  body('effective_to')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('effective_to must be a valid date'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
export const updatePriceListItemsValidation = [
  ...createPriceListItemsValidation,
];
