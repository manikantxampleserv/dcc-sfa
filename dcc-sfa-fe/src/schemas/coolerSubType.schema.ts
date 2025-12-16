import * as Yup from 'yup';

export const coolerSubTypeValidationSchema = Yup.object({
  name: Yup.string()
    .required('Sub Type is required')
    .min(2, 'Sub Type must be at least 2 characters')
    .max(255, 'Sub Type must be less than 255 characters'),
  code: Yup.string().max(100, 'Code must be less than 100 characters'),
  cooler_type_id: Yup.number()
    .required('Cooler Type is required')
    .integer('Cooler Type must be a valid integer'),
  description: Yup.string(),
  is_active: Yup.string().required('Status is required'),
});

export type CoolerSubTypeFormValues = Yup.InferType<
  typeof coolerSubTypeValidationSchema
>;
