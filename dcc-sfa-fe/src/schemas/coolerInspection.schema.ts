import * as Yup from 'yup';

export const coolerInspectionValidationSchema = Yup.object({
  cooler_id: Yup.number()
    .required('Cooler is required')
    .positive('Please select a valid cooler'),

  inspected_by: Yup.number()
    .required('Inspector is required')
    .positive('Please select a valid inspector'),

  visit_id: Yup.number().nullable().positive('Please select a valid visit'),

  inspection_date: Yup.date()
    .nullable()
    .max(new Date(), 'Inspection date cannot be in the future'),

  temperature: Yup.number()
    .nullable()
    .min(-50, 'Temperature must be at least -50°C')
    .max(50, 'Temperature must be at most 50°C'),

  is_working: Yup.string()
    .oneOf(['Y', 'N'], 'Please select working status')
    .required('Working status is required'),

  issues: Yup.string()
    .nullable()
    .max(2000, 'Issues must be less than 2000 characters'),

  images: Yup.string()
    .nullable()
    .max(2000, 'Images must be less than 2000 characters'),

  latitude: Yup.number()
    .nullable()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: Yup.number()
    .nullable()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),

  action_required: Yup.string()
    .oneOf(['Y', 'N'], 'Please select action required status')
    .required('Action required status is required'),

  action_taken: Yup.string()
    .nullable()
    .max(2000, 'Action taken must be less than 2000 characters'),

  next_inspection_due: Yup.date()
    .nullable()
    .min(new Date(), 'Next inspection due must be in the future'),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Please select active status')
    .required('Active status is required'),
});
