import * as Yup from 'yup';

const profileValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  phone_number: Yup.string().matches(
    /^[0-9+\-\s()]+$/,
    'Invalid phone number format'
  ),
  address: Yup.string().max(500, 'Address must not exceed 500 characters'),
  joining_date: Yup.string(),
  password: Yup.string().min(6, 'Password must be at least 6 characters'),
});

export default profileValidationSchema;
