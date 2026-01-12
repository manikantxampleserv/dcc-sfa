import * as Yup from 'yup';

export const batchLotValidationSchema = Yup.object({
  batch_number: Yup.string()
    .required('Batch number is required')
    .max(50, 'Batch number must not exceed 50 characters'),
  lot_number: Yup.string()
    .max(50, 'Lot number must not exceed 50 characters')
    .nullable(),
  manufacturing_date: Yup.date()
    .required('Manufacturing date is required')
    .max(new Date(), 'Manufacturing date cannot be in the future'),
  expiry_date: Yup.date()
    .required('Expiry date is required')
    .min(
      Yup.ref('manufacturing_date'),
      'Expiry date must be after manufacturing date'
    )
    .min(new Date(), 'Expiry date must be a future date'),
  quantity: Yup.number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be a whole number'),
  remaining_quantity: Yup.number()
    .positive('Remaining quantity must be positive')
    .integer('Remaining quantity must be a whole number')
    .max(Yup.ref('quantity'), 'Remaining quantity cannot exceed total quantity')
    .nullable(),
  supplier_name: Yup.string()
    .max(255, 'Supplier name must not exceed 255 characters')
    .nullable(),
  purchase_price: Yup.number()
    .positive('Purchase price must be positive')
    .nullable(),
  quality_grade: Yup.string()
    .oneOf(['A', 'B', 'C', 'D', 'F'], 'Quality grade must be A, B, C, D, or F')
    .nullable(),
  storage_location: Yup.string()
    .max(100, 'Storage location must not exceed 100 characters')
    .nullable(),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Y or N')
    .required('Status is required'),
});
