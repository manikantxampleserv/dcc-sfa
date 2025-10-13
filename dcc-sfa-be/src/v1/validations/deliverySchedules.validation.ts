import { body } from 'express-validator';

export const deliverySchedulesValidation = [
  body('order_id').isInt().withMessage('Order ID is required'),
  body('customer_id').isInt().withMessage('Customer ID is required'),
  body('scheduled_date').isDate().withMessage('Scheduled date is required'),
  body('scheduled_time_slot')
    .optional()
    .isString()
    .withMessage('Scheduled time slot must be a string'),
  body('assigned_vehicle_id')
    .optional()
    .isInt()
    .withMessage('Assigned vehicle ID must be an integer'),
  body('assigned_driver_id')
    .optional()
    .isInt()
    .withMessage('Assigned driver ID must be an integer'),
  body('status').optional().isString().withMessage('Status must be a string'),
  body('priority')
    .optional()
    .isString()
    .withMessage('Priority must be a string'),
  body('delivery_instructions')
    .optional()
    .isString()
    .withMessage('Delivery instructions must be a string'),
  body('actual_delivery_time')
    .optional()
    .isDate()
    .withMessage('Actual delivery time must be a date'),
  body('delivery_proof')
    .optional()
    .isString()
    .withMessage('Delivery proof must be a string'),
  body('customer_signature')
    .optional()
    .isString()
    .withMessage('Customer signature must be a string'),
  body('failure_reason')
    .optional()
    .isString()
    .withMessage('Failure reason must be a string'),
  body('rescheduled_date')
    .optional()
    .isDate()
    .withMessage('Rescheduled date must be a date'),
  body('is_active')
    .optional()
    .isString()
    .withMessage('Is active must be a string'),
];
