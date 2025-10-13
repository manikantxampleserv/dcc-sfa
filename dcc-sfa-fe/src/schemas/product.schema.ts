import * as yup from 'yup';

export const productValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Product name is required')
    .min(1, 'Product name must be at least 1 character')
    .max(255, 'Product name must be at most 255 characters'),
  description: yup
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .nullable(),
  category_id: yup
    .number()
    .required('Category is required')
    .min(1, 'Please select a valid category'),
  brand_id: yup
    .number()
    .required('Brand is required')
    .min(1, 'Please select a valid brand'),
  unit_of_measurement: yup
    .number()
    .required('Unit of measurement is required')
    .min(1, 'Please select a valid unit of measurement'),
  base_price: yup.number().min(0, 'Base price must be at least 0').nullable(),
  tax_rate: yup
    .number()
    .min(0, 'Tax rate must be at least 0')
    .max(100, 'Tax rate cannot exceed 100%')
    .nullable(),
  is_active: yup
    .string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
});
