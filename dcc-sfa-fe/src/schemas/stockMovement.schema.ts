import * as Yup from 'yup';

export const stockMovementValidationSchema = Yup.object({
  product_id: Yup.number()
    .required('Product is required')
    .min(1, 'Please select a valid product'),

  batch_id: Yup.number()
    .nullable()
    .min(1, 'Batch ID must be a positive number'),

  serial_id: Yup.number()
    .nullable()
    .min(1, 'Serial ID must be a positive number'),

  movement_type: Yup.string()
    .required('Movement type is required')
    .min(2, 'Movement type must be at least 2 characters')
    .max(50, 'Movement type must be less than 50 characters'),

  reference_type: Yup.string()
    .nullable()
    .max(50, 'Reference type must be less than 50 characters'),

  reference_id: Yup.number()
    .nullable()
    .min(1, 'Reference ID must be a positive number'),

  from_location_id: Yup.number()
    .nullable()
    .min(1, 'From location ID must be a positive number'),

  to_location_id: Yup.number()
    .nullable()
    .min(1, 'To location ID must be a positive number')
    .test(
      'different-locations',
      'From and To locations cannot be the same',
      function (value) {
        const { from_location_id } = this.parent;
        if (value && from_location_id && value === from_location_id) {
          return this.createError({
            message: 'From and To locations cannot be the same',
            path: 'to_location_id',
          });
        }
        return true;
      }
    ),

  quantity: Yup.number()
    .required('Quantity is required')
    .min(1, 'Quantity must be a positive number')
    .integer('Quantity must be a whole number'),

  movement_date: Yup.date().nullable().typeError('Please enter a valid date'),

  remarks: Yup.string()
    .nullable()
    .max(1000, 'Remarks must be less than 1000 characters'),

  van_inventory_id: Yup.number()
    .nullable()
    .min(1, 'Van inventory ID must be a positive number'),

  is_active: Yup.string()
    .required('Status is required')
    .oneOf(['Y', 'N'], 'Status must be Active or Inactive'),
});
