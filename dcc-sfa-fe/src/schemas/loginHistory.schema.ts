/**
 * @fileoverview Login History Validation Schema
 * @description Yup validation schema for login history form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for login history creation and update forms
 */
export const loginHistoryValidationSchema = Yup.object({
  user_id: Yup.number()
    .required('User ID is required')
    .positive('User ID must be a positive integer')
    .integer('User ID must be an integer'),
  login_time: Yup.date().nullable(),
  logout_time: Yup.date().nullable(),
  ip_address: Yup.string().max(
    50,
    'IP address must be less than 50 characters'
  ),
  device_info: Yup.string().max(
    255,
    'Device info must be less than 255 characters'
  ),
  os_info: Yup.string().max(100, 'OS info must be less than 100 characters'),
  app_version: Yup.string().max(
    50,
    'App version must be less than 50 characters'
  ),
  location_latitude: Yup.number().nullable(),
  location_longitude: Yup.number().nullable(),
  login_status: Yup.string().oneOf(
    ['success', 'failed'],
    'Invalid login status'
  ),
  failure_reason: Yup.string().max(
    255,
    'Failure reason must be less than 255 characters'
  ),
  is_active: Yup.string()
    .required('Status is required')
    .oneOf(['Y', 'N'], 'Status must be Y or N'),
});

/**
 * Type definition for login history form values
 */
export type LoginHistoryFormValues = Yup.InferType<
  typeof loginHistoryValidationSchema
>;
