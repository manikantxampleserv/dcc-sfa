import { body } from 'express-validator';

export const createSurveyValidation = [
  body('title')
    .notEmpty()
    .withMessage('Survey title is required')
    .isString()
    .withMessage('Survey title must be a string')
    .isLength({ min: 2, max: 255 })
    .withMessage('Survey title must be between 2 and 255 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'cooler_inspection',
      'customer_feedback',
      'outlet_audit',
      'competitor_analysis',
      'brand_visibility',
      'general',
    ])
    .withMessage('Category must be a valid survey category'),

  body('target_roles')
    .optional()
    .isString()
    .withMessage('Target roles must be a string'),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean'),

  body('published_at')
    .optional()
    .isISO8601()
    .withMessage('published_at must be a valid date'),

  body('expires_at')
    .optional()
    .isISO8601()
    .withMessage('expires_at must be a valid date'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be either "Y" or "N"'),

  body('fields').optional().isArray().withMessage('Fields must be an array'),

  body('fields.*.label')
    .if(body('fields').exists())
    .notEmpty()
    .withMessage('Field label is required'),

  body('fields.*.field_type')
    .if(body('fields').exists())
    .isIn([
      'text',
      'textarea',
      'number',
      'select',
      'checkbox',
      'radio',
      'date',
      'time',
      'photo',
      'signature',
    ])
    .withMessage('Invalid field type'),

  body('fields.*.options')
    .optional()
    .isString()
    .withMessage('Field options must be a string'),

  body('fields.*.is_required')
    .optional()
    .isBoolean()
    .withMessage('is_required must be a boolean'),

  body('fields.*.sort_order')
    .optional()
    .isInt()
    .withMessage('sort_order must be an integer'),
];
