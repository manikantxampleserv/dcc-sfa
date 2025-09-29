import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  role_id: Yup.number()
    .required('Role is required')
    .positive('Please select a valid role'),
  phone_number: Yup.string().matches(
    /^[0-9+\-\s()]+$/,
    'Invalid phone number format'
  ),
  reporting_to: Yup.number().required('Reporting to is required'),
  password: Yup.string().when('isEdit', {
    is: false,
    then: schema =>
      schema
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    otherwise: schema =>
      schema.min(6, 'Password must be at least 6 characters'),
  }),
  is_active: Yup.string().required('Status is required'),
});

export default validationSchema;
