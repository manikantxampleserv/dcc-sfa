/**
 * @fileoverview Product Category Validation Schema
 * @description Yup validation schema for product category form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for product category creation and update forms
 */
export const productCategoryValidationSchema = Yup.object({
  category_name: Yup.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must not exceed 100 characters')
    .required('Category name is required'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be either Active or Inactive')
    .required('Status is required'),
});

/**
 * Type definition for product category form values
 */
export type ProductCategoryFormValues = Yup.InferType<
  typeof productCategoryValidationSchema
>;
