/**
 * @fileoverview Product Sub Category Validation Schema
 * @description Yup validation schema for product sub category form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for product sub category creation and update forms
 */
export const productSubCategoryValidationSchema = Yup.object({
  sub_category_name: Yup.string()
    .min(2, 'Sub category name must be at least 2 characters')
    .max(100, 'Sub category name must not exceed 100 characters')
    .required('Sub category name is required'),
  product_category_id: Yup.number()
    .required('Product category is required')
    .positive('Product category must be selected'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be either Active or Inactive')
    .required('Status is required'),
});

/**
 * Type definition for product sub category form values
 */
export type ProductSubCategoryFormValues = Yup.InferType<
  typeof productSubCategoryValidationSchema
>;
