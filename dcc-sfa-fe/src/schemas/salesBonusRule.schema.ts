import * as yup from 'yup';

export const salesBonusRuleValidationSchema = yup.object().shape({
  sales_target_id: yup
    .number()
    .required('Sales target is required')
    .min(1, 'Please select a valid sales target'),
  achievement_min_percent: yup
    .number()
    .required('Minimum achievement percentage is required')
    .min(0, 'Minimum achievement percentage must be at least 0')
    .max(100, 'Minimum achievement percentage cannot exceed 100')
    .test(
      'less-than-max',
      'Minimum achievement percentage must be less than maximum achievement percentage',
      function (value) {
        const { achievement_max_percent } = this.parent;
        return (
          !achievement_max_percent || !value || value < achievement_max_percent
        );
      }
    ),
  achievement_max_percent: yup
    .number()
    .required('Maximum achievement percentage is required')
    .min(0, 'Maximum achievement percentage must be at least 0')
    .max(100, 'Maximum achievement percentage cannot exceed 100')
    .test(
      'greater-than-min',
      'Maximum achievement percentage must be greater than minimum achievement percentage',
      function (value) {
        const { achievement_min_percent } = this.parent;
        return (
          !achievement_min_percent || !value || value > achievement_min_percent
        );
      }
    ),
  bonus_amount: yup
    .number()
    .nullable()
    .min(0, 'Bonus amount must be non-negative')
    .test(
      'bonus-or-percent',
      'Either bonus amount or bonus percentage must be provided',
      function (value) {
        const { bonus_percent } = this.parent;
        return value || bonus_percent;
      }
    ),
  bonus_percent: yup
    .number()
    .nullable()
    .min(0, 'Bonus percentage must be non-negative')
    .max(100, 'Bonus percentage cannot exceed 100')
    .test(
      'bonus-or-percent',
      'Either bonus amount or bonus percentage must be provided',
      function (value) {
        const { bonus_amount } = this.parent;
        return value || bonus_amount;
      }
    ),
  is_active: yup
    .string()
    .required('Status is required')
    .oneOf(['Y', 'N'], 'Status must be either Active (Y) or Inactive (N)'),
});
