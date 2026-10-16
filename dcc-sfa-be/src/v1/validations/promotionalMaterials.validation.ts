import { body } from 'express-validator';

/**
 * Validations for creating a new promotional material in the catalog.
 */
export const createPromotionalMaterialValidation = [
  body('code')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Item code must be a string')
    .trim(),

  body('name')
    .notEmpty()
    .withMessage('Item name is required')
    .isString()
    .withMessage('Item name must be a string')
    .trim(),

  body('uom')
    .optional({ nullable: true })
    .isString()
    .withMessage('UOM must be a string')
    .trim(),

  body('default_unit_value')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Default unit value must be a valid number'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string')
    .trim(),

  body('is_active')
    .optional({ nullable: true })
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];

/**
 * Validations for updating an existing promotional material.
 */
export const updatePromotionalMaterialValidation = [
  body('code')
    .optional()
    .isString()
    .withMessage('Item code must be a string')
    .trim(),

  body('name')
    .optional()
    .isString()
    .withMessage('Item name must be a string')
    .trim(),

  body('uom')
    .optional({ nullable: true })
    .isString()
    .withMessage('UOM must be a string')
    .trim(),

  body('default_unit_value')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Default unit value must be a valid number'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string')
    .trim(),

  body('is_active')
    .optional({ nullable: true })
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
