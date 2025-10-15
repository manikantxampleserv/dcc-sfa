import * as Yup from 'yup';

export const assetMovementValidationSchema = Yup.object({
  asset_id: Yup.number()
    .positive('Asset ID must be a positive number')
    .required('Asset ID is required'),
  from_location: Yup.string()
    .max(255, 'From location must be less than 255 characters')
    .nullable(),
  to_location: Yup.string()
    .max(255, 'To location must be less than 255 characters')
    .nullable(),
  movement_type: Yup.string()
    .oneOf(
      ['transfer', 'maintenance', 'repair', 'disposal', 'return', 'other'],
      'Movement type must be one of: transfer, maintenance, repair, disposal, return, other'
    )
    .nullable(),
  movement_date: Yup.date()
    .required('Movement date is required')
    .max(new Date(), 'Movement date cannot be in the future'),
  performed_by: Yup.number()
    .positive('Performed by must be a positive number')
    .required('Performed by is required'),
  notes: Yup.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable(),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Active status must be Y or N')
    .required('Active status is required'),
});
