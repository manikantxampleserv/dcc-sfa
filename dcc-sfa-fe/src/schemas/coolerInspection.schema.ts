import * as Yup from 'yup';

export const coolerInspectionValidationSchema = Yup.object({
  cooler_id: Yup.number()
    .required('Cooler is required')
    .positive('Please select a valid cooler'),

  inspected_by: Yup.number()
    .required('Inspector is required')
    .positive('Please select a valid inspector'),

  visit_id: Yup.number()
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
    .nullable()
    .positive('Please select a valid visit'),

  inspection_date: Yup.date()
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
    .typeError('Inspection date must be a valid date')
    .max(new Date(), 'Inspection date cannot be in the future')
    .min(
      new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
      'Inspection date cannot be more than 30 years ago'
    )
    .nullable(),

  temperature: Yup.number()
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
    .typeError('Temperature must be a number')
    .min(-50, 'Temperature must be at least -50°C')
    .max(50, 'Temperature must be at most 50°C')
    .nullable(),

  is_working: Yup.string()
    .oneOf(['Y', 'N'], 'Please select working status')
    .required('Working status is required'),

  issues: Yup.string()
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
    .max(2000, 'Issues must be less than 2000 characters')
    .nullable(),

  images: Yup.string()
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
    .max(2000, 'Images must be less than 2000 characters')
    .nullable(),

  latitude: Yup.number()
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
    .typeError('Latitude must be a number')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .nullable(),

  longitude: Yup.number()
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
    .typeError('Longitude must be a number')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .nullable(),

  action_required: Yup.string()
    .oneOf(['Y', 'N'], 'Please select action required status')
    .required('Action required status is required'),

  action_taken: Yup.string()
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
    .max(2000, 'Action taken must be less than 2000 characters')
    .nullable(),

  next_inspection_due: Yup.date()
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
    .typeError('Next inspection due must be a valid date')
    .min(new Date(), 'Next inspection due must be in the future')
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
      'Next inspection due cannot be more than 5 years in the future'
    )
    .nullable()
    .when('inspection_date', ([inspection_date], schema) => {
      // Only apply min validation if inspection_date exists and is valid
      if (
        inspection_date &&
        inspection_date !== 'undefined' &&
        inspection_date !== ''
      ) {
        return schema.min(
          inspection_date,
          'Next inspection due must be after inspection date'
        );
      }
      return schema;
    }),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Please select active status')
    .required('Active status is required'),
});
