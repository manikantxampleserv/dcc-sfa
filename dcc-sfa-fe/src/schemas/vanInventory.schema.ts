/**
 * @fileoverview Van Inventory Validation Schema
 * @description Yup validation schema for van inventory forms
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

export const vanInventoryValidationSchema = Yup.object({
  user_id: Yup.number()
    .required('User is required')
    .positive('User ID must be a positive number')
    .integer('User ID must be an integer'),

  product_id: Yup.number()
    .required('Product is required')
    .positive('Product ID must be a positive number')
    .integer('Product ID must be an integer'),

  batch_id: Yup.number()
    .positive('Batch ID must be a positive number')
    .integer('Batch ID must be an integer')
    .nullable()
    .optional(),

  serial_no_id: Yup.number()
    .positive('Serial No ID must be a positive number')
    .integer('Serial No ID must be an integer')
    .nullable()
    .optional(),

  quantity: Yup.number()
    .min(0, 'Quantity must be 0 or greater')
    .integer('Quantity must be an integer')
    .required('Quantity is required'),

  reserved_quantity: Yup.number()
    .min(0, 'Reserved quantity must be 0 or greater')
    .integer('Reserved quantity must be an integer')
    .default(0)
    .optional(),

  available_quantity: Yup.number()
    .min(0, 'Available quantity must be 0 or greater')
    .integer('Available quantity must be an integer')
    .optional(),

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
    .required('Status is required'),
});
