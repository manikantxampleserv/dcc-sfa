/**
 * @fileoverview Asset Type Validation Schema
 * @description Yup validation schema for asset type form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for asset type creation and update forms
 */
export const assetTypeValidationSchema = Yup.object({
  name: Yup.string()
    .required('Asset type name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: Yup.string().max(
    255,
    'Description must be less than 255 characters'
  ),
  category: Yup.string().max(50, 'Category must be less than 50 characters'),
  brand: Yup.string().max(100, 'Brand must be less than 100 characters'),
  is_active: Yup.string().required('Status is required'),
});

/**
 * Type definition for asset type form values
 */
export type AssetTypeFormValues = Yup.InferType<
  typeof assetTypeValidationSchema
>;
