/**
 * @fileoverview Payment Collection Validation Schema
 * @description Yup validation schema for payment collection form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for payment collection creation and update forms
 */
export const paymentValidationSchema = Yup.object({
  customer_id: Yup.string()
    .required('Customer is required')
    .test(
      'is-number',
      'Customer must be selected',
      (value: string | undefined) => {
        if (!value) return false;
        return !isNaN(Number(value)) && Number(value) > 0;
      }
    ),

  payment_date: Yup.string()
    .required('Payment date is required')
    .test(
      'is-valid-date',
      'Please enter a valid date',
      (value: string | undefined) => {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
    ),

  collected_by: Yup.string()
    .required('Collected by is required')
    .test(
      'is-number',
      'Collector must be selected',
      (value: string | undefined) => {
        if (!value) return false;
        return !isNaN(Number(value)) && Number(value) > 0;
      }
    ),

  method: Yup.string()
    .required('Payment method is required')
    .oneOf(
      ['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'],
      'Please select a valid payment method'
    ),

  total_amount: Yup.number()
    .required('Total amount is required')
    .min(0.01, 'Amount must be greater than 0')
    .test(
      'is-positive',
      'Amount must be a positive number',
      (value: number | undefined) => {
        return value !== undefined && value > 0;
      }
    ),

  notes: Yup.string()
    .optional()
    .max(500, 'Notes must not exceed 500 characters'),

  currency_id: Yup.string()
    .optional()
    .test(
      'is-number',
      'Currency must be valid',
      (value: string | undefined) => {
        if (!value) return true; // Optional field
        return !isNaN(Number(value)) && Number(value) > 0;
      }
    ),

  is_active: Yup.string()
    .required('Active status is required')
    .oneOf(['Y', 'N'], 'Please select a valid status'),

  // Payment lines validation (for future use)
  payment_lines: Yup.array()
    .optional()
    .of(
      Yup.object({
        invoice_id: Yup.number()
          .required('Invoice ID is required')
          .min(1, 'Invoice ID must be valid'),
        amount_applied: Yup.number()
          .required('Amount applied is required')
          .min(0.01, 'Amount applied must be greater than 0'),
        notes: Yup.string()
          .optional()
          .max(500, 'Payment line notes must not exceed 500 characters'),
      })
    ),
});

/**
 * Type definition for payment form values
 */
export type PaymentFormValues = Yup.InferType<typeof paymentValidationSchema>;
