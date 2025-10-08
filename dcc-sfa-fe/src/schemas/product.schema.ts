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
  category: yup
    .string()
    .max(100, 'Category cannot exceed 100 characters')
    .nullable(),
  brand: yup.string().max(100, 'Brand cannot exceed 100 characters').nullable(),
  unit_of_measure: yup
    .string()
    .max(50, 'Unit of measure cannot exceed 50 characters')
    .nullable(),
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
