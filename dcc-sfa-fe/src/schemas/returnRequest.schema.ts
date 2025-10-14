import * as Yup from 'yup';

export const returnRequestValidationSchema = Yup.object({
  customer_id: Yup.number()
    .required('Customer is required')
    .min(1, 'Please select a valid customer'),
  product_id: Yup.number()
    .required('Product is required')
    .min(1, 'Please select a valid product'),
  serial_id: Yup.number()
    .nullable()
    .min(1, 'Serial ID must be a positive number'),
  return_date: Yup.string()
    .nullable()
    .test('is-valid-date', 'Invalid date format', value => {
      if (!value) return true; // Allow null/empty values
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('not-future', 'Return date cannot be in the future', value => {
      if (!value) return true; // Allow null/empty values
      const date = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return date <= today;
    }),
  reason: Yup.string()
    .nullable()
    .max(500, 'Reason must be less than 500 characters'),
  status: Yup.string()
    .nullable()
    .oneOf(
      [
        'pending',
        'approved',
        'rejected',
        'processing',
        'completed',
        'cancelled',
      ],
      'Invalid status'
    ),
  approved_by: Yup.number()
    .nullable()
    .min(1, 'Approved by must be a valid user ID')
    .when('status', {
      is: 'approved',
      then: schema =>
        schema.required('Approved by is required when status is approved'),
      otherwise: schema => schema.nullable(),
    }),
  approved_date: Yup.string()
    .nullable()
    .test('is-valid-date', 'Invalid date format', value => {
      if (!value) return true; // Allow null/empty values
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('not-future', 'Approved date cannot be in the future', value => {
      if (!value) return true; // Allow null/empty values
      const date = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return date <= today;
    }),
  resolution_notes: Yup.string()
    .nullable()
    .max(1000, 'Resolution notes must be less than 1000 characters'),
  is_active: Yup.string()
    .required('Active status is required')
    .oneOf(['Y', 'N'], 'Active status must be Y or N'),
});
