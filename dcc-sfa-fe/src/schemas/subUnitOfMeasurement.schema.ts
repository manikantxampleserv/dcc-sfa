/**
 * @fileoverview Sub Unit of Measurement Validation Schema
 * @description Yup validation schema for sub unit of measurement form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for sub unit of measurement creation and update forms
 */
export const subUnitOfMeasurementValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Sub unit name must be at least 2 characters')
    .max(100, 'Sub unit name must not exceed 100 characters')
    .required('Sub unit name is required'),
  code: Yup.string()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must not exceed 20 characters')
    .matches(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers')
    .optional(),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  unit_of_measurement_id: Yup.number()
    .required('Unit of measurement is required')
    .positive('Unit of measurement must be selected'),
  product_id: Yup.number()
    .required('Product is required')
    .positive('Product must be selected'),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be either Active or Inactive')
    .required('Status is required'),
});

/**
 * Type definition for sub unit of measurement form values
 */
export type SubUnitOfMeasurementFormValues = Yup.InferType<
  typeof subUnitOfMeasurementValidationSchema
>;
