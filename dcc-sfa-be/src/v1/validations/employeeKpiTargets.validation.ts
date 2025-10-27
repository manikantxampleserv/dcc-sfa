import { body } from 'express-validator';

export const createEmployeeKpiTargetValidation = [
  body('employee_id').isInt().withMessage('Employee ID is required'),
  body('kpi_name').isString().withMessage('KPI name is required'),
  body('target_value').isFloat().withMessage('Target value is required'),
  body('measure_unit').isString().optional(),
  body('period_start').isDate().withMessage('Period start is required'),
  body('period_end').isDate().withMessage('Period end is required'),
  body('is_active').isString().optional(),
];
