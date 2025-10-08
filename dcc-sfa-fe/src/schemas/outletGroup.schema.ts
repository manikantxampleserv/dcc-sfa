import * as yup from 'yup';

export const outletGroupValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Outlet group name is required')
    .min(2, 'Outlet group name must be at least 2 characters')
    .max(255, 'Outlet group name must be at most 255 characters'),
  description: yup
    .string()
    .max(500, 'Description must be at most 500 characters')
    .nullable(),
  discount_percentage: yup
    .number()
    .min(0, 'Discount percentage must be at least 0')
    .max(100, 'Discount percentage must be at most 100')
    .nullable(),
  credit_terms: yup
    .number()
    .min(0, 'Credit terms must be at least 0')
    .integer('Credit terms must be a whole number')
    .nullable(),
  payment_terms: yup
    .string()
    .max(100, 'Payment terms must be at most 100 characters')
    .nullable(),
  price_group: yup
    .string()
    .max(50, 'Price group must be at most 50 characters')
    .nullable(),
  is_active: yup
    .string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
  customerGroups: yup
    .array()
    .of(
      yup.object().shape({
        customer_id: yup.number().required('Customer ID is required'),
        is_active: yup.string().oneOf(['Y', 'N']).default('Y'),
      })
    )
    .min(1, 'At least one customer must be selected')
    .required('Customers are required'),
});
