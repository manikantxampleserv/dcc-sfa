import * as yup from 'yup';

export const orderItemValidationSchema = yup.object().shape({
  product_id: yup
    .number()
    .required('Product is required')
    .positive('Product ID must be positive'),
  product_name: yup.string().nullable(),
  unit: yup.string().nullable(),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number'),
  unit_price: yup
    .number()
    .required('Unit price is required')
    .min(0, 'Unit price must be non-negative'),
  discount_amount: yup
    .number()
    .min(0, 'Discount amount must be non-negative')
    .nullable(),
  tax_amount: yup.number().min(0, 'Tax amount must be non-negative').nullable(),
  total_amount: yup
    .number()
    .min(0, 'Total amount must be non-negative')
    .nullable(),
  notes: yup
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .nullable(),
});

export const orderValidationSchema = yup.object().shape({
  order_number: yup
    .string()
    .min(3, 'Order number must be at least 3 characters')
    .max(50, 'Order number must be at most 50 characters')
    .nullable(),
  parent_id: yup
    .number()
    .required('Customer is required')
    .positive('Customer ID must be positive'),
  salesperson_id: yup
    .number()
    .required('Sales Person is required')
    .positive('Sales Person ID must be positive'),
  currency_id: yup.number().positive('Currency ID must be positive').nullable(),
  order_date: yup.string().nullable(),
  delivery_date: yup.string().nullable(),
  status: yup
    .string()
    .oneOf(
      [
        'draft',
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
      'Invalid order status'
    )
    .nullable(),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high', 'urgent'], 'Invalid priority')
    .nullable(),
  order_type: yup
    .string()
    .oneOf(['regular', 'urgent', 'promotional', 'sample'], 'Invalid order type')
    .nullable(),
  payment_method: yup
    .string()
    .oneOf(
      ['cash', 'credit', 'cheque', 'bank_transfer'],
      'Invalid payment method'
    )
    .nullable(),
  payment_terms: yup
    .string()
    .max(50, 'Payment terms must be at most 50 characters')
    .nullable(),
  subtotal: yup.number().min(0, 'Subtotal must be non-negative').nullable(),
  discount_amount: yup
    .number()
    .min(0, 'Discount amount must be non-negative')
    .nullable(),
  tax_amount: yup.number().min(0, 'Tax amount must be non-negative').nullable(),
  shipping_amount: yup
    .number()
    .min(0, 'Shipping amount must be non-negative')
    .nullable(),
  total_amount: yup
    .number()
    .min(0, 'Total amount must be non-negative')
    .nullable(),
  notes: yup
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .nullable(),
  shipping_address: yup
    .string()
    .max(500, 'Shipping address must be at most 500 characters')
    .nullable(),
  approval_status: yup
    .string()
    .oneOf(['pending', 'approved', 'rejected'], 'Invalid approval status')
    .nullable(),
  approved_by: yup
    .number()
    .positive('Approved by ID must be positive')
    .nullable(),
  is_active: yup
    .string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
  order_items: yup
    .array()
    .of(orderItemValidationSchema)
    .min(1, 'At least one order item is required')
    .required('Order items are required'),
});

export const orderUpdateValidationSchema = orderValidationSchema.shape({
  order_number: yup
    .string()
    .min(3, 'Order number must be at least 3 characters')
    .max(50, 'Order number must be at most 50 characters')
    .nullable(),
  parent_id: yup.number().positive('Customer ID must be positive').nullable(),
  salesperson_id: yup
    .number()
    .positive('Salesperson ID must be positive')
    .nullable(),
  order_items: yup
    .array()
    .of(orderItemValidationSchema)
    .min(1, 'At least one order item is required')
    .nullable(),
});

export const orderItemCreateValidationSchema = yup.object().shape({
  product_id: yup
    .number()
    .required('Product is required')
    .positive('Product ID must be positive'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number'),
  unit_price: yup
    .number()
    .required('Unit price is required')
    .min(0, 'Unit price must be non-negative'),
  discount_amount: yup
    .number()
    .min(0, 'Discount amount must be non-negative')
    .default(0),
  tax_amount: yup.number().min(0, 'Tax amount must be non-negative').default(0),
  notes: yup
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .nullable(),
});
