import { body } from 'express-validator';

export const createZoneValidation = [
  body('parent_id')
    .isInt()
    .withMessage('Parent ID is required and must be a number'),

  body('depot_id').optional().isInt().withMessage('Depot ID must be a number'),

  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('supervisor_id')
    .optional()
    .isInt()
    .withMessage('Supervisor ID must be a number'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),

  body('joining_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Joining date must be a valid date'),
];
