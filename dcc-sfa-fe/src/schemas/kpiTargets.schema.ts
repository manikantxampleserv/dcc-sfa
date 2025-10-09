import * as Yup from 'yup';

export const kpiTargetValidationSchema = Yup.object({
  employee_id: Yup.number()
    .required('Employee is required')
    .positive('Employee must be selected'),

  kpi_name: Yup.string()
    .required('KPI name is required')
    .min(2, 'KPI name must be at least 2 characters')
    .max(100, 'KPI name must not exceed 100 characters')
    .trim(),

  target_value: Yup.number()
    .required('Target value is required')
    .min(0, 'Target value must be non-negative')
    .typeError('Target value must be a valid number'),

  measure_unit: Yup.string()
    .nullable()
    .max(50, 'Measure unit must not exceed 50 characters')
    .trim(),

  period_start: Yup.date()
    .required('Period start date is required')
    .typeError('Period start must be a valid date'),

  period_end: Yup.date()
    .required('Period end date is required')
    .typeError('Period end must be a valid date')
    .when('period_start', (period_start, schema) => {
      if (period_start && period_start[0]) {
        return schema.min(
          period_start[0],
          'Period end date must be after period start date'
        );
      }
      return schema;
    }),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .default('Y'),
});

export type KpiTargetFormData = Yup.InferType<typeof kpiTargetValidationSchema>;
