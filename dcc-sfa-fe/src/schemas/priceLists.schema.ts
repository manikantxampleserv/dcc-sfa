import * as Yup from 'yup';

export const priceListItemSchema = Yup.object({
  product_id: Yup.number()
    .required('Product is required')
    .positive('Product ID must be positive'),

  unit_price: Yup.number()
    .required('Unit price is required')
    .min(0, 'Unit price must be non-negative'),

  uom: Yup.string().nullable().max(50, 'UOM must not exceed 50 characters'),

  discount_percent: Yup.number()
    .nullable()
    .min(0, 'Discount percent must be non-negative')
    .max(100, 'Discount percent cannot exceed 100'),

  effective_from: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null) return null;
      return value;
    }),

  effective_to: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null) return null;
      return value;
    })
    .when('effective_from', (effective_from, schema) => {
      if (effective_from && effective_from[0]) {
        return schema.min(
          effective_from[0],
          'Effective to date must be after effective from date'
        );
      }
      return schema;
    }),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .default('Y'),
});

export const priceListValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),

  description: Yup.string()
    .nullable()
    .max(255, 'Description must not exceed 255 characters')
    .trim(),

  currency_code: Yup.string()
    .nullable()
    .max(10, 'Currency code must not exceed 10 characters')
    .trim()
    .uppercase(),

  valid_from: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null) return null;
      return value;
    }),

  valid_to: Yup.date()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null) return null;
      return value;
    })
    .when('valid_from', (valid_from, schema) => {
      if (valid_from && valid_from[0]) {
        return schema.min(
          valid_from[0],
          'Valid to date must be after valid from date'
        );
      }
      return schema;
    }),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .default('Y'),

  priceListItems: Yup.array().of(priceListItemSchema).nullable(),
});

export type PriceListFormData = Yup.InferType<typeof priceListValidationSchema>;
export type PriceListItemFormData = Yup.InferType<typeof priceListItemSchema>;
