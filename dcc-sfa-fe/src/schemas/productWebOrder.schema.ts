import * as Yup from 'yup';

export const productWebOrderValidationSchema = Yup.object({
  name: Yup.string()
    .required('Product web order name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  code: Yup.string().max(100, 'Code must be less than 100 characters'),
  is_active: Yup.string().required('Status is required'),
});

export type ProductWebOrderFormValues = Yup.InferType<
  typeof productWebOrderValidationSchema
>;
