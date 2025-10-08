/**
 * @fileoverview Warehouse Validation Schema
 * @description Yup validation schema for warehouse form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for warehouse creation and update forms
 */
export const warehouseValidationSchema = Yup.object({
  name: Yup.string()
    .required('Warehouse name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  type: Yup.string().max(50, 'Type must be less than 50 characters'),
  location: Yup.string().max(255, 'Location must be less than 255 characters'),
  is_active: Yup.string().required('Status is required'),
});

/**
 * Type definition for warehouse form values
 */
export type WarehouseFormValues = Yup.InferType<
  typeof warehouseValidationSchema
>;
