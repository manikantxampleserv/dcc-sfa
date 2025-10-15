import * as Yup from 'yup';

export const creditNoteValidationSchema = Yup.object({
  parent_id: Yup.number()
    .positive('Parent ID must be a positive number')
    .required('Parent ID is required'),
  customer_id: Yup.number()
    .positive('Customer ID must be a positive number')
    .required('Customer ID is required'),
  currency_id: Yup.number()
    .positive('Currency ID must be a positive number')
    .required('Currency ID is required'),
  credit_note_date: Yup.date().required('Credit note date is required'),
  due_date: Yup.date()
    .min(Yup.ref('credit_note_date'), 'Due date must be after credit note date')
    .required('Due date is required'),
  status: Yup.string()
    .oneOf(
      ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
      'Invalid status'
    )
    .required('Status is required'),
  reason: Yup.string()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must be less than 500 characters')
    .required('Reason is required'),
  payment_method: Yup.string()
    .oneOf(
      ['cash', 'credit', 'cheque', 'bank_transfer'],
      'Invalid payment method'
    )
    .required('Payment method is required'),
  subtotal: Yup.number()
    .min(0, 'Subtotal must be non-negative')
    .required('Subtotal is required'),
  discount_amount: Yup.number()
    .min(0, 'Discount amount must be non-negative')
    .required('Discount amount is required'),
  tax_amount: Yup.number()
    .min(0, 'Tax amount must be non-negative')
    .required('Tax amount is required'),
  shipping_amount: Yup.number()
    .min(0, 'Shipping amount must be non-negative')
    .required('Shipping amount is required'),
  total_amount: Yup.number()
    .min(0, 'Total amount must be non-negative')
    .required('Total amount is required'),
  amount_applied: Yup.number()
    .min(0, 'Amount applied must be non-negative')
    .required('Amount applied is required'),
  balance_due: Yup.number()
    .min(0, 'Balance due must be non-negative')
    .required('Balance due is required'),
  notes: Yup.string().max(1000, 'Notes must be less than 1000 characters'),
  billing_address: Yup.string().max(
    500,
    'Billing address must be less than 500 characters'
  ),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Must be Y or N')
    .required('Is active is required'),
  creditNoteItems: Yup.array()
    .of(
      Yup.object({
        product_id: Yup.number()
          .positive('Product ID must be a positive number')
          .required('Product ID is required'),
        quantity: Yup.number()
          .positive('Quantity must be positive')
          .required('Quantity is required'),
        unit_price: Yup.number()
          .min(0, 'Unit price must be non-negative')
          .required('Unit price is required'),
        discount_amount: Yup.number().min(
          0,
          'Discount amount must be non-negative'
        ),
        tax_amount: Yup.number().min(0, 'Tax amount must be non-negative'),
        notes: Yup.string().max(500, 'Notes must be less than 500 characters'),
      })
    )
    .min(1, 'At least one credit note item is required'),
});
