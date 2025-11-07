import * as yup from 'yup';

export const routeTypeValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Route type name is required')
    .min(1, 'Route type name must be at least 1 character')
    .max(100, 'Route type name must be at most 100 characters')
    .trim(),
  is_active: yup
    .string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
});

