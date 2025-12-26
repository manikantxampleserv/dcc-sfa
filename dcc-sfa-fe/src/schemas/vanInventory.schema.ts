/**
 * @fileoverview Van Inventory Validation Schema
 * @description Yup validation schema for van inventory forms
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

export const vanInventoryValidationSchema = Yup.object({
  user_id: Yup.number()
    .required('Van Inventory User is required')
    .positive('Van Inventory User ID must be a positive number')
    .integer('Van Inventory User ID must be an integer'),

  loading_type: Yup.string()
    .oneOf(['L', 'U'], 'Loading Type must be Load (L) or Unload (U)')
    .required('Loading Type is required'),

  status: Yup.string()
    .oneOf(
      ['D', 'A', 'C'],
      'Status must be Draft (D), Confirmed (A), or Canceled (C)'
    )
    .required('Status is required'),

  document_date: Yup.string().required('Document date is required'),

  vehicle_id: Yup.number()
    .positive('Vehicle ID must be a positive number')
    .integer('Vehicle ID must be an integer')
    .nullable()
    .optional(),

  location_type: Yup.string()
    .oneOf(['van', 'warehouse', 'depot', 'store'], 'Invalid location type')
    .default('van')
    .optional(),

  location_id: Yup.number()
    .positive('Location ID must be a positive number')
    .integer('Location ID must be an integer')
    .nullable()
    .optional(),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Must be Y or N')
    .default('Y')
    .required('Active status is required'),
});
