import * as yup from 'yup';

export const visitValidationSchema = yup.object().shape({
  customer_id: yup.string().required('Customer is required'),
  sales_person_id: yup.string().required('Salesperson is required'),
  route_id: yup.string().nullable(),
  zones_id: yup.string().nullable(),
  visit_date: yup.string().nullable(),
  visit_time: yup.string().nullable(),
  purpose: yup
    .string()
    .max(500, 'Purpose must be at most 500 characters')
    .nullable(),
  status: yup
    .string()
    .oneOf(
      ['planned', 'in_progress', 'completed', 'cancelled'],
      'Invalid status'
    )
    .nullable(),
  start_latitude: yup.string().nullable(),
  start_longitude: yup.string().nullable(),
  end_latitude: yup.string().nullable(),
  end_longitude: yup.string().nullable(),
  orders_created: yup
    .number()
    .min(0, 'Orders created must be a positive number')
    .nullable(),
  amount_collected: yup.string().nullable(),
  visit_notes: yup
    .string()
    .max(1000, 'Visit notes must be at most 1000 characters')
    .nullable(),
  customer_feedback: yup
    .string()
    .max(1000, 'Customer feedback must be at most 1000 characters')
    .nullable(),
  next_visit_date: yup.string().nullable(),
  is_active: yup
    .string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
});
