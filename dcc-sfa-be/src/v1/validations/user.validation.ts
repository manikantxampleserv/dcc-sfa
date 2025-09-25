import { body } from 'express-validator';

export const createUserValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role_id')
    .isInt()
    .withMessage('Role ID is required and must be a number'),
  body('parent_id')
    .optional()
    .isInt()
    .withMessage('Parent ID must be a number'),
  body('depot_id').optional().isInt().withMessage('Depot ID must be a number'),
  body('zone_id').optional().isInt().withMessage('Zone ID must be a number'),
  body('employee_id').optional().isString(),
  body('joining_date')
    .optional()
    .isISO8601()
    .withMessage('Joining date must be a valid date'),
  body('phone_number')
    .optional()
    .isString()
    .withMessage('Phone number must be a string'),
  body('address').optional().isString(),
  body('reporting_to').optional().isInt(),
  body('profile_image')
    .optional()
    .isURL()
    .withMessage('Profile image must be a URL'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];

export const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('email').optional().isEmail().withMessage('Enter a valid email'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'user', 'manager'])
    .withMessage('Role must be admin, user or manager'),
];
