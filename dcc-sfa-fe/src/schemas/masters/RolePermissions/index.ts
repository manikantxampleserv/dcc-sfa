import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must not exceed 50 characters'),
  description: Yup.string().max(
    200,
    'Description must not exceed 200 characters'
  ),
  is_active: Yup.string().required('Status is required'),
  permissions: Yup.array().min(1, 'At least one permission must be selected'),
});

export default validationSchema;
