import * as Yup from 'yup';

export const coolerInstallationValidationSchema = Yup.object({
  customer_id: Yup.number()
    .required('Customer is required')
    .positive('Customer must be selected'),

  code: Yup.string()
    .min(2, 'Cooler code must be at least 2 characters')
    .max(50, 'Cooler code must be less than 50 characters'),

  brand: Yup.string().max(100, 'Brand must be less than 100 characters'),

  model: Yup.string().max(100, 'Model must be less than 100 characters'),

  serial_number: Yup.string().max(
    100,
    'Serial number must be less than 100 characters'
  ),

  capacity: Yup.number().min(0, 'Capacity must be non-negative'),

  install_date: Yup.date()
    .transform((value, originalValue) => {
      if (
        originalValue === 'undefined' ||
        originalValue === '' ||
        originalValue === null
      ) {
        return null;
      }
      return value;
    })
    .typeError('Installation date must be a valid date')
    .max(new Date(), 'Installation date cannot be in the future')
    .min(
      new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
      'Installation date cannot be more than 30 years ago'
    )
    .nullable(),

  last_service_date: Yup.date()
    .transform((value, originalValue) => {
      if (
        originalValue === 'undefined' ||
        originalValue === '' ||
        originalValue === null
      ) {
        return null;
      }
      return value;
    })
    .typeError('Last service date must be a valid date')
    .max(new Date(), 'Last service date cannot be in the future')
    .nullable()
    .when('install_date', ([install_date], schema) => {
      // Only apply min validation if install_date exists and is valid
      if (install_date && install_date !== 'undefined' && install_date !== '') {
        return schema.min(
          install_date,
          'Last service date cannot be before installation date'
        );
      }
      return schema;
    }),

  next_service_due: Yup.date()
    .transform((value, originalValue) => {
      if (
        originalValue === 'undefined' ||
        originalValue === '' ||
        originalValue === null
      ) {
        return null;
      }
      return value;
    })
    .typeError('Next service due must be a valid date')
    .min(new Date(), 'Next service due must be in the future')
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
      'Next service due cannot be more than 5 years in the future'
    )
    .nullable()
    .when('last_service_date', ([last_service_date], schema) => {
      // Only apply min validation if last_service_date exists and is valid
      if (
        last_service_date &&
        last_service_date !== 'undefined' &&
        last_service_date !== ''
      ) {
        return schema.min(
          last_service_date,
          'Next service due must be after last service date'
        );
      }
      return schema;
    }),

  status: Yup.string().max(20, 'Status must be less than 20 characters'),

  temperature: Yup.number()
    .typeError('Temperature must be a number')
    .min(-30, 'Temperature cannot be below -30°C')
    .max(50, 'Temperature cannot be above 50°C')
    .nullable(),

  energy_rating: Yup.string()
    .matches(
      /^(A\+\+|A\+|A|B|C|D|E|F|G)$/i,
      'Energy rating must be one of: A++, A+, A, B, C, D, E, F, G'
    )
    .max(10, 'Energy rating must be less than 10 characters'),

  warranty_expiry: Yup.date()
    .transform((value, originalValue) => {
      if (
        originalValue === 'undefined' ||
        originalValue === '' ||
        originalValue === null
      ) {
        return null;
      }
      return value;
    })
    .typeError('Warranty expiry must be a valid date')
    .min(new Date(), 'Warranty expiry cannot be in the past')
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() + 20)),
      'Warranty expiry cannot be more than 20 years in the future'
    )
    .nullable(),

  maintenance_contract: Yup.string().max(
    100,
    'Maintenance contract must be less than 100 characters'
  ),

  technician_id: Yup.number().positive('Technician must be selected'),

  last_scanned_date: Yup.date()
    .transform((value, originalValue) => {
      if (
        originalValue === 'undefined' ||
        originalValue === '' ||
        originalValue === null
      ) {
        return null;
      }
      return value;
    })
    .typeError('Last scanned date must be a valid date')
    .max(new Date(), 'Last scanned date cannot be in the future')
    .min(
      new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
      'Last scanned date cannot be more than 2 years ago'
    )
    .nullable(),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Active or Inactive')
    .required('Status is required'),
});
