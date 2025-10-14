import * as Yup from 'yup';

export const deliveryScheduleValidationSchema = Yup.object({
  order_id: Yup.number()
    .required('Order ID is required')
    .positive('Order ID must be a positive number'),

  customer_id: Yup.number()
    .required('Customer ID is required')
    .positive('Customer ID must be a positive number'),

  scheduled_date: Yup.date()
    .required('Scheduled date is required')
    .min(new Date(), 'Scheduled date cannot be in the past'),

  scheduled_time_slot: Yup.string()
    .optional()
    .max(50, 'Time slot must be less than 50 characters'),

  assigned_vehicle_id: Yup.number()
    .optional()
    .positive('Vehicle ID must be a positive number'),

  assigned_driver_id: Yup.number()
    .optional()
    .positive('Driver ID must be a positive number'),

  status: Yup.string()
    .optional()
    .oneOf(
      [
        'scheduled',
        'in_transit',
        'delivered',
        'failed',
        'cancelled',
        'rescheduled',
        'returned',
        'refunded',
      ],
      'Invalid status'
    ),

  priority: Yup.string()
    .optional()
    .oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority'),

  delivery_instructions: Yup.string()
    .optional()
    .max(500, 'Delivery instructions must be less than 500 characters'),

  actual_delivery_time: Yup.string()
    .optional()
    .test(
      'is-valid-date',
      'Actual delivery time must be a valid date',
      value => {
        if (!value) return true; // Optional field
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
    ),

  delivery_proof: Yup.string()
    .optional()
    .max(255, 'Delivery proof must be less than 255 characters'),

  customer_signature: Yup.string()
    .optional()
    .max(255, 'Customer signature must be less than 255 characters'),

  failure_reason: Yup.string()
    .optional()
    .max(500, 'Failure reason must be less than 500 characters'),

  rescheduled_date: Yup.string()
    .optional()
    .test('is-valid-date', 'Rescheduled date must be a valid date', value => {
      if (!value) return true; // Optional field
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('is-future-date', 'Rescheduled date cannot be in the past', value => {
      if (!value) return true; // Optional field
      const date = new Date(value);
      return date >= new Date();
    }),

  is_active: Yup.string()
    .required('Active status is required')
    .oneOf(['Y', 'N'], 'Active status must be Y or N'),
});
