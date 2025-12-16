import * as Yup from 'yup';

export const productTargetGroupValidationSchema = Yup.object({
  name: Yup.string()
    .required('Product target group name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  code: Yup.string().max(100, 'Code must be less than 100 characters'),
  is_active: Yup.string().required('Status is required'),
});

export type ProductTargetGroupFormValues = Yup.InferType<
  typeof productTargetGroupValidationSchema
>;
