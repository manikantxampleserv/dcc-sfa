/**
 * @fileoverview Zone Validation Schema
 * @description Yup validation schema for zone form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for zone creation and update forms
 */
export const zoneValidationSchema = Yup.object({
  parent_id: Yup.number()
    .required('Depot is required')
    .positive('Invalid depot'),
  name: Yup.string()
    .required('Zone name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: Yup.string().max(
    255,
    'Description must be less than 255 characters'
  ),
  supervisor_id: Yup.number().positive('Invalid supervisor'),
  is_active: Yup.string().required('Status is required'),
});

/**
 * Type definition for zone form values
 */
export type ZoneFormValues = Yup.InferType<typeof zoneValidationSchema>;
