/**
 * @fileoverview Asset Sub Type Validation Schema
 * @description Yup validation schema for asset sub type form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for asset sub type creation and update forms
 */
export const assetSubTypeValidationSchema = Yup.object({
  name: Yup.string()
    .required('Asset sub type name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: Yup.string().max(
    255,
    'Description must be less than 255 characters'
  ),
  asset_type_id: Yup.number()
    .required('Asset type is required')
    .positive('Asset type must be a positive number')
    .integer('Asset type must be an integer'),
  model: Yup.string().max(50, 'Model must be less than 50 characters'),
  manufacturer: Yup.string().max(100, 'Manufacturer must be less than 100 characters'),
  specifications: Yup.string().max(
    500,
    'Specifications must be less than 500 characters'
  ),
  is_active: Yup.string().required('Status is required'),
});

/**
 * Type definition for asset sub type form values
 */
export type AssetSubTypeFormValues = Yup.InferType<
  typeof assetSubTypeValidationSchema
>;
