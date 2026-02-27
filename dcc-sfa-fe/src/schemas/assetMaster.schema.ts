import * as Yup from 'yup';

export const assetMasterValidationSchema = Yup.object({
  name: Yup.string()
    .required('Asset name is required')
    .min(1, 'Asset name must be at least 1 character')
    .max(255, 'Asset name must not exceed 255 characters'),

  asset_type_id: Yup.number()
    .required('Asset type is required')
    .positive('Asset type must be selected'),

  asset_sub_type_id: Yup.number()
    .nullable()
    .positive('Asset sub type must be valid')
    .transform((value, originalValue) => {
      if (
        originalValue === '' ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }
      return value;
    }),

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
      if (
        originalValue === '' ||
        originalValue === null ||
        originalValue === undefined
      )
        return null;
      return value;
    })
    .max(new Date(), 'Purchase date cannot be in the future'),

  warranty_expiry: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (
        originalValue === '' ||
        originalValue === null ||
        originalValue === undefined
      )
        return null;
      return value;
    })
    .when('purchase_date', (purchase_date, schema) => {
      if (
        purchase_date &&
        purchase_date instanceof Date &&
        !isNaN(purchase_date.getTime())
      ) {
        return schema.min(
          purchase_date,
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

  warranty_period: Yup.string()
    .oneOf(['1', '2', '3', '4', '5'], 'Invalid warranty period selected')
    .default('1'),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .default('Y'),
});

export type AssetMasterFormData = Yup.InferType<
  typeof assetMasterValidationSchema
>;
