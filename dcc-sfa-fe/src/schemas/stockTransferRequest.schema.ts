/**
 * @fileoverview Stock Transfer Request Validation Schema
 * @description Yup validation schema for stock transfer request forms
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

export const stockTransferRequestValidationSchema = Yup.object({
  source_type: Yup.string()
    .required('Source type is required')
    .min(2, 'Source type must be at least 2 characters')
    .max(50, 'Source type must be less than 50 characters'),

  source_id: Yup.number()
    .required('Source ID is required')
    .positive('Source ID must be a positive number')
    .integer('Source ID must be an integer'),

  destination_type: Yup.string()
    .required('Destination type is required')
    .min(2, 'Destination type must be at least 2 characters')
    .max(50, 'Destination type must be less than 50 characters'),

  destination_id: Yup.number()
    .required('Destination ID is required')
    .positive('Destination ID must be a positive number')
    .integer('Destination ID must be an integer')
    .test(
      'different-from-source',
      'Source and destination cannot be the same',
      function (value) {
        const { source_id } = this.parent;
        return value !== source_id;
      }
    ),

  requested_by: Yup.number()
    .required('Requested by is required')
    .positive('Requested by must be a positive number')
    .integer('Requested by must be an integer'),

  status: Yup.string()
    .oneOf(
      ['pending', 'approved', 'rejected', 'in_progress', 'completed'],
      'Invalid status'
    )
    .optional(),

  approved_by: Yup.number()
    .positive('Approved by must be a positive number')
    .integer('Approved by must be an integer')
    .nullable()
    .optional(),

  approved_at: Yup.date().nullable().optional(),

  is_active: Yup.string().oneOf(['Y', 'N'], 'Must be Y or N').default('Y'),

  stock_transfer_lines: Yup.array()
    .of(
      Yup.object({
        product_id: Yup.number()
          .required('Product ID is required')
          .positive('Product ID must be a positive number')
          .integer('Product ID must be an integer'),

        batch_id: Yup.number()
          .positive('Batch ID must be a positive number')
          .integer('Batch ID must be an integer')
          .nullable()
          .optional(),

        quantity: Yup.number()
          .required('Quantity is required')
          .positive('Quantity must be a positive number')
          .min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one transfer line is required')
    .required('Transfer lines are required'),
});
