import { body } from 'express-validator';

export const createRouteValidation = [
  body('parent_id')
    .isInt()
    .withMessage('Parent ID is required and must be a number'),

  body('depot_id')
    .isInt()
    .withMessage('Depot ID is required and must be a number'),

  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),

  body('salesperson_id')
    .optional()
    .isInt()
    .withMessage('Salesperson ID must be a number'),

  body('start_location')
    .optional()
    .isString()
    .withMessage('Start location must be a string'),

  body('end_location')
    .optional()
    .isString()
    .withMessage('End location must be a string'),

  body('estimated_distance')
    .optional()
    .isDecimal()
    .withMessage('Estimated distance must be a decimal'),

  body('estimated_time')
    .optional()
    .isInt()
    .withMessage('Estimated time must be an integer (minutes)'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
