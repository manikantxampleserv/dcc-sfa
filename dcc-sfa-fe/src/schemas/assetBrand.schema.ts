/**
 * @fileoverview Asset Brand Validation Schema
 * @description Yup validation schema for asset brand form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for asset brand creation and update forms
 */
export const assetBrandValidationSchema = Yup.object({
  name: Yup.string()
    .required('Asset brand name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  code: Yup.string().max(50, 'Code must be less than 50 characters'),
  description: Yup.string().max(
    500,
    'Description must be less than 500 characters'
  ),
  is_active: Yup.string().required('Status is required'),
});

/**
 * Type definition for asset brand form values
 */
export type AssetBrandFormValues = Yup.InferType<
  typeof assetBrandValidationSchema
>;
