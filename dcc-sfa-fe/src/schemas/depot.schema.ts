/**
 * @fileoverview Depot Validation Schema
 * @description Yup validation schema for depot form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for depot creation and update forms
 */
export const depotValidationSchema = Yup.object({
  parent_id: Yup.number()
    .required('Company is required')
    .positive('Invalid company'),
  name: Yup.string()
    .required('Depot name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  address: Yup.string().max(255, 'Address must be less than 255 characters'),
  city: Yup.string().max(50, 'City must be less than 50 characters'),
  state: Yup.string().max(50, 'State must be less than 50 characters'),
  zipcode: Yup.string().matches(/^[0-9]{5,6}$/, 'Invalid zip code format'),
  phone_number: Yup.string().matches(
    /^[0-9+\-\s()]+$/,
    'Invalid phone number format'
  ),
  email: Yup.string().email('Invalid email format'),
  manager_id: Yup.number().positive('Invalid manager'),
  supervisor_id: Yup.number().positive('Invalid supervisor'),
  coordinator_id: Yup.number().positive('Invalid coordinator'),
  latitude: Yup.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  longitude: Yup.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
  is_active: Yup.string().required('Status is required'),
});

/**
 * Type definition for depot form values
 */
export type DepotFormValues = Yup.InferType<typeof depotValidationSchema>;
