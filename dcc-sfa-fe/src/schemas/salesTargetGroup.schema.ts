/**
 * @fileoverview Sales Target Group Validation Schema
 * @description Validation schema for sales target group forms using Yup
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as Yup from 'yup';

export const salesTargetGroupValidationSchema = Yup.object({
  group_name: Yup.string()
    .required('Group name is required')
    .min(2, 'Group name must be at least 2 characters')
    .max(255, 'Group name must be less than 255 characters')
    .trim(),

  description: Yup.string()
    .max(500, 'Description must be less than 500 characters')
    .nullable()
    .optional(),

  is_active: Yup.string()
    .oneOf(['Y', 'N'], 'Must be Y or N')
    .required('Active status is required'),

  salesTargetMember: Yup.array()
    .of(
      Yup.object({
        id: Yup.number().optional(),
        sales_person_id: Yup.number()
          .required('Sales person is required')
          .positive('Sales person ID must be positive'),
        is_active: Yup.string()
          .oneOf(['Y', 'N'], 'Must be Y or N')
          .default('Y'),
      })
    )
    .min(1, 'At least one sales person must be selected')
    .optional(),
});

export type SalesTargetGroupFormData = Yup.InferType<
  typeof salesTargetGroupValidationSchema
>;
