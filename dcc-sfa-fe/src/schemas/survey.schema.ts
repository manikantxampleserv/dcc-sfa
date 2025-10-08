import * as yup from 'yup';

export const surveyValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required('Survey title is required')
    .min(2, 'Survey title must be at least 2 characters')
    .max(255, 'Survey title must be at most 255 characters'),
  description: yup
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .nullable(),
  category: yup
    .string()
    .oneOf(
      [
        'cooler_inspection',
        'customer_feedback',
        'outlet_audit',
        'competitor_analysis',
        'brand_visibility',
        'general',
      ],
      'Category must be a valid survey category'
    )
    .required('Category is required'),
  target_roles: yup.string().nullable(),
  expires_at: yup.date().nullable(),
  is_active: yup
    .string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
  fields: yup
    .array()
    .of(
      yup.object().shape({
        label: yup.string().required('Field label is required'),
        field_type: yup
          .string()
          .oneOf(
            [
              'text',
              'textarea',
              'number',
              'select',
              'checkbox',
              'radio',
              'date',
              'time',
              'photo',
              'signature',
            ],
            'Invalid field type'
          )
          .required('Field type is required'),
        options: yup.string().nullable(),
        is_required: yup.boolean(),
        sort_order: yup.number().integer(),
      })
    )
    .optional(),
});
