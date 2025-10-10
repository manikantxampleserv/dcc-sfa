import * as Yup from 'yup';

export const salesTargetValidationSchema = Yup.object({
  sales_target_group_id: Yup.number()
    .required('Sales target group is required')
    .positive('Sales target group must be selected'),

  product_category_id: Yup.number()
    .required('Product category is required')
    .positive('Product category must be selected'),

  target_quantity: Yup.number()
    .required('Target quantity is required')
    .min(1, 'Target quantity must be at least 1')
    .typeError('Target quantity must be a valid number'),

  target_amount: Yup.number()
    .nullable()
    .min(0, 'Target amount must be non-negative')
    .typeError('Target amount must be a valid number'),

  start_date: Yup.date()
    .required('Start date is required')
    .typeError('Start date must be a valid date'),

  end_date: Yup.date()
    .required('End date is required')
    .typeError('End date must be a valid date')
    .when('start_date', (start_date, schema) => {
      if (start_date && start_date[0]) {
        return schema.min(start_date[0], 'End date must be after start date');
      }
      return schema;
    }),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .default('Y'),
});

export type SalesTargetFormData = Yup.InferType<
  typeof salesTargetValidationSchema
>;
