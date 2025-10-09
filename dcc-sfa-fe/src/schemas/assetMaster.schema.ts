import * as Yup from 'yup';

export const assetMasterValidationSchema = Yup.object({
  asset_type_id: Yup.number()
    .required('Asset type is required')
    .positive('Asset type must be selected'),

  serial_number: Yup.string()
    .required('Serial number is required')
    .min(1, 'Serial number must be at least 1 character')
    .max(100, 'Serial number must not exceed 100 characters')
    .matches(
      /^[A-Za-z0-9\-_]+$/,
      'Serial number can only contain letters, numbers, hyphens, and underscores'
    ),

  purchase_date: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null) return null;
      return value;
    })
    .max(new Date(), 'Purchase date cannot be in the future'),

  warranty_expiry: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null) return null;
      return value;
    })
    .when('purchase_date', (purchase_date, schema) => {
      if (purchase_date && purchase_date[0]) {
        return schema.min(
          purchase_date[0],
          'Warranty expiry must be after purchase date'
        );
      }
      return schema;
    }),

  current_location: Yup.string()
    .nullable()
    .max(255, 'Current location must not exceed 255 characters'),

  current_status: Yup.string()
    .nullable()
    .oneOf(
      [
        'Available',
        'In Use',
        'Under Maintenance',
        'Retired',
        'Lost',
        'Damaged',
        '',
      ],
      'Invalid status selected'
    ),

  assigned_to: Yup.string()
    .nullable()
    .max(100, 'Assigned to must not exceed 100 characters'),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .default('Y'),
});

export type AssetMasterFormData = Yup.InferType<
  typeof assetMasterValidationSchema
>;
