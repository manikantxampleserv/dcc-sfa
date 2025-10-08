/**
 * @fileoverview Vehicle Validation Schema
 * @description Yup validation schema for vehicle form validation
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

/**
 * Validation schema for vehicle creation and update forms
 */
export const vehicleValidationSchema = Yup.object({
  vehicle_number: Yup.string()
    .required('Vehicle number is required')
    .min(1, 'Vehicle number must be at least 1 character')
    .max(20, 'Vehicle number must be less than 20 characters'),
  type: Yup.string()
    .required('Vehicle type is required')
    .max(20, 'Type must be less than 20 characters'),
  make: Yup.string().max(50, 'Make must be less than 50 characters'),
  model: Yup.string().max(50, 'Model must be less than 50 characters'),
  year: Yup.number()
    .min(1900, 'Year must be at least 1900')
    .max(2100, 'Year must be at most 2100'),
  capacity: Yup.number().positive('Capacity must be a positive number'),
  fuel_type: Yup.string().max(20, 'Fuel type must be less than 20 characters'),
  status: Yup.string().max(20, 'Status must be less than 20 characters'),
  mileage: Yup.number().positive('Mileage must be a positive number'),
  is_active: Yup.string().required('Status is required'),
});

/**
 * Type definition for vehicle form values
 */
export type VehicleFormValues = Yup.InferType<typeof vehicleValidationSchema>;
