import * as Yup from 'yup';

export const coolerInstallationValidationSchema = Yup.object({
  customer_id: Yup.number()
    .required('Customer is required')
    .positive('Customer must be selected'),

  code: Yup.string()
    .required('Cooler code is required')
    .min(2, 'Cooler code must be at least 2 characters')
    .max(50, 'Cooler code must be less than 50 characters'),

  brand: Yup.string().max(100, 'Brand must be less than 100 characters'),

  model: Yup.string().max(100, 'Model must be less than 100 characters'),

  serial_number: Yup.string().max(
    100,
    'Serial number must be less than 100 characters'
  ),

  capacity: Yup.number().min(0, 'Capacity must be non-negative'),

  install_date: Yup.date(),

  last_service_date: Yup.date(),

  next_service_due: Yup.date(),

  status: Yup.string().max(20, 'Status must be less than 20 characters'),

  temperature: Yup.number(),

  energy_rating: Yup.string().max(
    10,
    'Energy rating must be less than 10 characters'
  ),

  warranty_expiry: Yup.date(),

  maintenance_contract: Yup.string().max(
    100,
    'Maintenance contract must be less than 100 characters'
  ),

  technician_id: Yup.number().positive('Technician must be selected'),

  last_scanned_date: Yup.date(),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Active or Inactive')
    .required('Status is required'),
});
