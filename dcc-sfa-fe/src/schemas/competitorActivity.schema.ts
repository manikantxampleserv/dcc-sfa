import * as Yup from 'yup';

export const competitorActivityValidationSchema = Yup.object({
  customer: Yup.object()
    .shape({
      id: Yup.number().required(),
      name: Yup.string().required(),
    })
    .required('Customer is required'),
  visit_id: Yup.number()
    .positive('Visit ID must be a positive number')
    .nullable(),
  brand_name: Yup.string()
    .required('Brand name is required')
    .max(255, 'Brand name must be less than 255 characters'),
  product_name: Yup.string()
    .max(255, 'Product name must be less than 255 characters')
    .nullable(),
  observed_price: Yup.number()
    .min(0, 'Observed price must be a positive number')
    .nullable(),
  promotion_details: Yup.string()
    .max(1000, 'Promotion details must be less than 1000 characters')
    .nullable(),
  visibility_score: Yup.number()
    .min(0, 'Visibility score must be at least 0')
    .max(100, 'Visibility score must be at most 100')
    .nullable(),
  image_url: Yup.string()
    .url('Image URL must be a valid URL')
    .max(500, 'Image URL must be less than 500 characters')
    .nullable(),
  remarks: Yup.string()
    .max(1000, 'Remarks must be less than 1000 characters')
    .nullable(),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Active status must be Y or N')
    .required('Active status is required'),
});
