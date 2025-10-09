import { body } from 'express-validator';

export const createKpiTargetValidation = [
  body('employee_id')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer'),

  body('kpi_name')
    .notEmpty()
    .withMessage('KPI name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('KPI name must be between 2 and 100 characters')
    .trim(),

  body('target_value')
    .notEmpty()
    .withMessage('Target value is required')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Target value must be a valid decimal number')
    .custom(value => {
      if (parseFloat(value) < 0) {
        throw new Error('Target value must be non-negative');
      }
      return true;
    }),

  body('measure_unit')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Measure unit must not exceed 50 characters')
    .trim(),

  body('period_start')
    .notEmpty()
    .withMessage('Period start date is required')
    .isISO8601()
    .withMessage('Period start must be a valid date (YYYY-MM-DD)'),

  body('period_end')
    .notEmpty()
    .withMessage('Period end date is required')
    .isISO8601()
    .withMessage('Period end must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (
        req.body.period_start &&
        new Date(value) <= new Date(req.body.period_start)
      ) {
        throw new Error('Period end date must be after period start date');
      }
      return true;
    }),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateKpiTargetValidation = [
  body('employee_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer'),

  body('kpi_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('KPI name must be between 2 and 100 characters')
    .trim(),

  body('target_value')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Target value must be a valid decimal number')
    .custom(value => {
      if (value !== undefined && parseFloat(value) < 0) {
        throw new Error('Target value must be non-negative');
      }
      return true;
    }),

  body('measure_unit')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Measure unit must not exceed 50 characters')
    .trim(),

  body('period_start')
    .optional()
    .isISO8601()
    .withMessage('Period start must be a valid date (YYYY-MM-DD)'),

  body('period_end')
    .optional()
    .isISO8601()
    .withMessage('Period end must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (
        value &&
        req.body.period_start &&
        new Date(value) <= new Date(req.body.period_start)
      ) {
        throw new Error('Period end date must be after period start date');
      }
      return true;
    }),

  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
