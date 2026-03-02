import * as Yup from 'yup';

export const assetMovementValidationSchema = Yup.object({
  asset_ids: Yup.array()
    .of(Yup.number().positive('Asset ID must be a positive number'))
    .min(1, 'At least one asset must be selected')
    .required('Asset selection is required'),
  from_direction: Yup.string()
    .oneOf(['outlet', 'depot'], 'From direction must be outlet or depot')
    .required('From direction is required'),
  from_outlet: Yup.number()
    .positive('From outlet must be a positive number')
    .nullable()
    .when('from_direction', {
      is: 'outlet',
      then: schema =>
        schema.required('From outlet is required when direction is outlet'),
      otherwise: schema => schema.notRequired(),
    }),
  from_depot: Yup.number()
    .positive('From depot must be a positive number')
    .nullable()
    .when('from_direction', {
      is: 'depot',
      then: schema =>
        schema.required('From depot is required when direction is depot'),
      otherwise: schema => schema.notRequired(),
    }),
  to_direction: Yup.string()
    .oneOf(['outlet', 'depot'], 'To direction must be outlet or depot')
    .required('To direction is required'),
  to_outlet: Yup.number()
    .positive('To outlet must be a positive number')
    .nullable()
    .when('to_direction', {
      is: 'outlet',
      then: schema =>
        schema.required('To outlet is required when direction is outlet'),
      otherwise: schema => schema.notRequired(),
    }),
  to_depot: Yup.number()
    .positive('To depot must be a positive number')
    .nullable()
    .when('to_direction', {
      is: 'depot',
      then: schema =>
        schema.required('To depot is required when direction is depot'),
      otherwise: schema => schema.notRequired(),
    }),
  movement_type: Yup.string()
    .oneOf(
      [
        'transfer',
        'maintenance',
        'repair',
        'disposal',
        'return',
        'installation',
      ],
      'Movement type must be one of: transfer, maintenance, repair, disposal, return, installation'
    )
    .nullable(),
  movement_date: Yup.date()
    .required('Movement date is required')
    .max(new Date(), 'Movement date cannot be in the future'),
  performed_by: Yup.number()
    .positive('Performed by must be a positive number')
    .required('Performed by is required'),
  priority: Yup.string()
    .oneOf(
      ['low', 'medium', 'high', 'urgent'],
      'Priority must be low, medium, high, or urgent'
    )
    .default('medium'),
  notes: Yup.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable(),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Active status must be Y or N')
    .required('Active status is required'),
});
