/**
 * @fileoverview Currency Validation Schema
 * @description Validation schema for currency forms using Yup
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

export const currencyValidationSchema = Yup.object({
  name: Yup.string()
    .required('Currency name is required')
    .min(2, 'Currency name must be at least 2 characters')
    .max(100, 'Currency name must be less than 100 characters')
    .trim(),

  code: Yup.string()
    .required('Currency code is required')
    .min(2, 'Currency code must be at least 2 characters')
    .max(10, 'Currency code must be less than 10 characters')
    .matches(
      /^[A-Z0-9]+$/,
      'Currency code must contain only uppercase letters and numbers'
    )
    .trim(),

  symbol: Yup.string()
    .max(10, 'Currency symbol must be less than 10 characters')
    .nullable()
    .optional(),

  exchange_rate_to_base: Yup.number()
    .positive('Exchange rate must be positive')
    .max(999999999999.999999, 'Exchange rate exceeds maximum allowed value')
    .nullable()
    .optional(),

  is_base: Yup.string()
    .oneOf(['Y', 'N'], 'Must be Y or N')
    .required('Base currency status is required'),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Must be Y or N')
    .required('Active status is required'),
});

export type CurrencyFormData = Yup.InferType<typeof currencyValidationSchema>;
