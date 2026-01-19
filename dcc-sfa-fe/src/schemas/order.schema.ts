import * as yup from 'yup';

export interface OrderFormValues {
  order_number: string;
  parent_id: number;
  salesperson_id: number;
  currency_id: number | null;
  order_date: string;
  delivery_date: string;
  status: string;
  priority: string;
  order_type: string;
  payment_method: string;
  payment_terms: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  notes: string;
  shipping_address: string;
  approval_status: string;
  is_active: string;
  order_items: OrderItemFormData[];
}

export interface OrderItemFormData {
  product_id: number;
  product_name?: string | null;
  unit?: string | null;
  tracking_type?: string | null;
  quantity: string;
  unit_price?: string;
  total_amount?: string;
  notes?: string;
  product_batches?: any[];
  product_serials?: any[];
}

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
    .typeError('Customer is required')
    .required('Customer is required')
    .positive('Customer ID must be positive'),
  salesperson_id: yup
    .number()
    .typeError('Sales Person is required')
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
    .oneOf(['P', 'A', 'R'], 'Invalid approval status')
    .nullable(),
  is_active: yup
    .string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
  order_items: yup.mixed().nullable(),
});

export const orderUpdateValidationSchema = orderValidationSchema.shape({
  order_number: yup
    .string()
    .min(3, 'Order number must be at least 3 characters')
    .max(50, 'Order number must be at most 50 characters')
    .nullable(),
  parent_id: yup
    .number()
    .typeError('Customer is required')
    .required('Customer is required')
    .positive('Customer ID must be positive'),
  salesperson_id: yup
    .number()
    .typeError('Salesperson is required')
    .required('Salesperson is required')
    .positive('Salesperson ID must be positive'),
  order_items: yup.mixed().nullable(),
});

export const orderItemCreateValidationSchema = yup.object().shape({
  product_id: yup
    .number()
    .required(
      'Product selection is required. Please select a product from the dropdown.'
    )
    .positive('Product ID must be positive')
    .test('is-not-zero', 'Product selection is required', value => value !== 0),
  product_name: yup.string().nullable(),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  unit_price: yup
    .number()
    .required('Unit price is required')
    .min(0, 'Unit price must be non-negative'),
  notes: yup
    .string()
    .max(500, 'Notes must be at most 500 characters')
    .nullable(),
});

export const orderItemsArrayValidationSchema = yup.object().shape({
  order_items: yup
    .array()
    .of(orderItemCreateValidationSchema)
    .min(1, 'At least one product must be added to the order')
    .test(
      'has-valid-products',
      'All items must have valid products',
      function (items) {
        if (!items || items.length === 0) return false;
        return items.every(item => {
          const productId = Number(item.product_id);
          const quantity = Number(item.quantity);
          return (
            item &&
            productId &&
            productId > 0 &&
            !isNaN(productId) &&
            quantity > 0 &&
            item.product_name
          );
        });
      }
    ),
});
