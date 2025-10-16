import * as Yup from 'yup';

export const assetMaintenanceValidationSchema = Yup.object({
  asset_id: Yup.number()
    .required('Asset is required')
    .positive('Asset ID must be positive'),
  maintenance_date: Yup.date()
    .required('Maintenance date is required')
    .max(new Date(), 'Maintenance date cannot be in the future'),
  issue_reported: Yup.string()
    .max(1000, 'Issue reported must be less than 1000 characters')
    .optional(),
  action_taken: Yup.string()
    .max(1000, 'Action taken must be less than 1000 characters')
    .optional(),
  technician_id: Yup.number()
    .required('Technician is required')
    .positive('Technician ID must be positive'),
  cost: Yup.number().min(0, 'Cost must be non-negative').optional(),
  remarks: Yup.string()
    .max(1000, 'Remarks must be less than 1000 characters')
    .optional(),
  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Status must be Active or Inactive')
    .required('Status is required'),
});
