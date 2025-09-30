import * as Yup from 'yup';

const companyValidationSchema = Yup.object({
  name: Yup.string()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters'),
  address: Yup.string().max(500, 'Address must not exceed 500 characters'),
  city: Yup.string().max(100, 'City must not exceed 100 characters'),
  state: Yup.string().max(100, 'State must not exceed 100 characters'),
  country: Yup.string().max(100, 'Country must not exceed 100 characters'),
  zipcode: Yup.string()
    .matches(/^[0-9]{5,10}$/, 'Invalid zip code format')
    .max(10, 'Zip code must not exceed 10 characters'),
  phone_number: Yup.string().matches(
    /^[0-9+\-\s()]+$/,
    'Invalid phone number format'
  ),
  email: Yup.string().email('Invalid email format'),
  website: Yup.string().url('Invalid website URL'),
  is_active: Yup.string().required('Status is required'),
});

export default companyValidationSchema;
