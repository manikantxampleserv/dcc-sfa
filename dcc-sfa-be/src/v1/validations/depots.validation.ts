import { body } from 'express-validator';

export const createDepotValidation = [
  body('parent_id')
    .isInt()
    .withMessage('Parent ID is required and must be a number'),

  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),

  body('address').optional().isString().withMessage('Address must be a string'),

  body('city').optional().isString().withMessage('City must be a string'),

  body('state').optional().isString().withMessage('State must be a string'),

  body('zipcode').optional().isString().withMessage('Zipcode must be a string'),

  body('phone_number')
    .optional()
    .isString()
    .withMessage('Phone number must be a string'),

  body('email').optional().isEmail().withMessage('Enter a valid email'),

  body('manager_id')
    .optional()
    .isInt()
    .withMessage('Manager ID must be a number'),

  body('supervisor_id')
    .optional()
    .isInt()
    .withMessage('Supervisor ID must be a number'),

  body('coordinator_id')
    .optional()
    .isInt()
    .withMessage('Coordinator ID must be a number'),

  body('latitude')
    .optional()
    .isDecimal()
    .withMessage('Latitude must be a decimal'),

  body('longitude')
    .optional()
    .isDecimal()
    .withMessage('Longitude must be a decimal'),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
