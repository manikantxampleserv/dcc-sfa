/**
 * @fileoverview Promotional Materials Validation Schema
 * @description Yup validation schema for creating and updating promotional materials
 * @version 1.0.0
 */

import * as Yup from 'yup';

export const promotionalMaterialValidationSchema = Yup.object({
  code: Yup.string()
    .nullable()
    .optional()
    .max(50, 'Item code must not exceed 50 characters')
    .trim(),

  name: Yup.string()
    .required('Item name is required')
    .min(1, 'Item name must be at least 1 character')
    .max(255, 'Item name must not exceed 255 characters')
    .trim(),

  uom: Yup.string()
    .required('Unit of Measurement is required')
    .max(20, 'UOM must not exceed 20 characters')
    .trim(),

  default_unit_value: Yup.number()
    .nullable()
    .min(0, 'Default unit value cannot be negative')
    .transform((value, originalValue) => {
      if (
        originalValue === '' ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }
      return Number(value);
    }),

  description: Yup.string()
    .nullable()
    .max(500, 'Description must not exceed 500 characters')
    .trim(),

  is_active: Yup.string().oneOf(['Y', 'N']).default('Y'),
});
