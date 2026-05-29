import * as Yup from 'yup';

export const unitOfMeasurementValidationSchema = Yup.object({
  name: Yup.string()
    .required('Unit name is required')
    .min(2, 'Unit name must be at least 2 characters')
    .max(100, 'Unit name must not exceed 100 characters')
    .trim(),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters')
    .nullable()
    .transform(value => (value === '' ? null : value)),
  category: Yup.string()
    .max(50, 'Category must not exceed 50 characters')
    .nullable()
    .transform(value => (value === '' ? null : value)),
  symbol: Yup.string()
    .max(10, 'Symbol must not exceed 10 characters')
    .nullable()
    .transform(value => (value === '' ? null : value)),
  sub_unit: Yup.string().nullable(),
  subunit_id: Yup.string().nullable(),
  conversion_rate: Yup.number()
    .typeError('Conversion rate must be a number')
    .positive('Conversion rate must be a positive number')
    .nullable()
    .when('subunit_id', {
      is: (val: string | null | undefined) => !!val && val !== 'none',
      then: schema =>
        schema.required(
          'Conversion rate is required when a sub unit is selected'
        ),
      otherwise: schema => schema.notRequired(),
    }),
  is_active: Yup.string()
    .required('Status is required')
    .oneOf(['Y', 'N'], 'Status must be either Active or Inactive'),
});
