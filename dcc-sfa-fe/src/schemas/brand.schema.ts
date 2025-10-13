import * as Yup from 'yup';

export const brandValidationSchema = Yup.object({
  name: Yup.string()
    .required('Brand name is required')
    .min(2, 'Brand name must be at least 2 characters')
    .max(100, 'Brand name must not exceed 100 characters')
    .trim(),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters')
    .nullable()
    .transform(value => (value === '' ? null : value)),
  is_active: Yup.string()
    .required('Status is required')
    .oneOf(['Y', 'N'], 'Status must be either Active or Inactive'),
});
