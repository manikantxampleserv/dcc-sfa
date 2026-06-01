import * as Yup from 'yup';

export const invoiceValidationSchema = Yup.object({
  invoice_method: Yup.string()
    .required('Invoice method is required')
    .oneOf(['order', 'direct'], 'Please select a valid invoice method'),

  parent_id: Yup.number()
    .when(['invoice_method'], (values: any[], schema: Yup.NumberSchema) => {
      const [invoice_method] = values;
      return invoice_method === 'order'
        ? schema.required('Order is required when based on order')
        : schema.optional();
    })
    .positive('Order must be a positive number'),

  customer_id: Yup.number()
    .when(['invoice_method'], (values: any[], schema: Yup.NumberSchema) => {
      const [invoice_method] = values;
      return invoice_method === 'direct'
        ? schema.required('Customer is required when direct invoice')
        : schema.optional();
    })
    .positive('Customer must be a positive number'),

  currency_id: Yup.number()
    .optional()
    .positive('Currency must be a positive number'),
  invoice_date: Yup.string().required('Invoice date is required'),
  due_date: Yup.string()
    .optional()
    .test(
      'due-date-after-invoice',
      'Due date must be after invoice date',
      function (value) {
        const { invoice_date } = this.parent;
        if (!value || !invoice_date) return true;
        const dueDate = new Date(value.split('/').reverse().join('-'));
        const invDate = new Date(invoice_date.split('/').reverse().join('-'));
        if (isNaN(dueDate.getTime())) {
          const isoDueDate = new Date(value);
          const isoInvDate = new Date(invoice_date);
          return isoDueDate >= isoInvDate;
        }
        return dueDate >= invDate;
      }
    ),

  status: Yup.string()
    .required('Status is required')
    .oneOf(
      ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      'Please select a valid status'
    ),

  payment_method: Yup.string()
    .optional()
    .oneOf(
      ['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'],
      'Please select a valid payment method'
    ),

  subtotal: Yup.number()
    .required('Subtotal is required')
    .min(0, 'Subtotal must be greater than or equal to 0'),

  discount_amount: Yup.number()
    .optional()
    .min(0, 'Discount amount must be greater than or equal to 0'),

  tax_amount: Yup.number()
    .optional()
    .min(0, 'Tax amount must be greater than or equal to 0'),

  shipping_amount: Yup.number()
    .optional()
    .min(0, 'Shipping amount must be greater than or equal to 0'),

  amount_paid: Yup.number()
    .optional()
    .min(0, 'Amount paid must be greater than or equal to 0'),

  balance_due: Yup.number()
    .optional()
    .min(0, 'Balance due must be greater than or equal to 0'),

  notes: Yup.string()
    .optional()
    .max(500, 'Notes must not exceed 500 characters'),

  billing_address: Yup.string()
    .optional()
    .max(500, 'Billing address must not exceed 500 characters'),

  is_active: Yup.string()
    .required('Status is required')
    .oneOf(['Y', 'N'], 'Status must be Active or Inactive'),
});
