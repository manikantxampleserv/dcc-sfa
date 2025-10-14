import * as yup from 'yup';

export const customerValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Customer name is required')
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must be at most 100 characters'),
  zones_id: yup.string().nullable(),
  type: yup
    .string()
    .oneOf(
      [
        'Retail',
        'Wholesale',
        'Corporate',
        'Industrial',
        'Healthcare',
        'Automotive',
        'Restaurant',
        'Service',
        'Manufacturing',
        'Distribution',
      ],
      'Invalid customer type'
    )
    .nullable(),
  contact_person: yup
    .string()
    .max(100, 'Contact person name must be at most 100 characters')
    .nullable(),
  phone_number: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .nullable(),
  email: yup.string().email('Invalid email format').nullable(),
  address: yup
    .string()
    .max(500, 'Address must be at most 500 characters')
    .nullable(),
  city: yup.string().max(100, 'City must be at most 100 characters').nullable(),
  state: yup
    .string()
    .max(100, 'State must be at most 100 characters')
    .nullable(),
  zipcode: yup
    .string()
    .max(20, 'Zipcode must be at most 20 characters')
    .nullable(),
  latitude: yup
    .string()
    .matches(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/, 'Invalid latitude format')
    .nullable(),
  longitude: yup
    .string()
    .matches(
      /^-?([1]?[1-7][1-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{1}\d{1,6}$/,
      'Invalid longitude format'
    )
    .nullable(),
  credit_limit: yup
    .string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Invalid credit limit format')
    .nullable(),
  outstanding_amount: yup
    .string()
    .matches(/^\d+(\.\d{1,2})?$/, 'Invalid outstanding amount format')
    .nullable(),
  route_id: yup.string().nullable(),
  salesperson_id: yup.string().nullable(),
  last_visit_date: yup.string().nullable(),
  is_active: yup
    .string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
});
