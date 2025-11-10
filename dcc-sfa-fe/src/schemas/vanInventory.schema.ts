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

  loading_type: Yup.string()
    .oneOf(['L', 'U'], 'Type must be Load (L) or Unload (U)')
    .required('Type is required'),

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

  van_inventory_items: Yup.array()
    .of(
      Yup.object({
        product_id: Yup.number()
          .required('Product is required')
          .positive('Product ID must be a positive number')
          .integer('Product ID must be an integer'),
        quantity: Yup.number()
          .min(0, 'Quantity must be 0 or greater')
          .integer('Quantity must be an integer')
          .required('Quantity is required'),
        unit_price: Yup.number()
          .min(0, 'Unit price must be 0 or greater')
          .optional(),
        discount_amount: Yup.number()
          .min(0, 'Discount amount must be 0 or greater')
          .optional(),
        tax_amount: Yup.number()
          .min(0, 'Tax amount must be 0 or greater')
          .optional(),
      })
    )
    .min(1, 'At least one inventory item is required'),
});
