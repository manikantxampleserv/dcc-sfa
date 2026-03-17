/**
 * @fileoverview Template Validation Schema
 * @description Yup validation schema for template form
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as yup from 'yup';

export const templateValidationSchema = yup.object({
  name: yup
    .string()
    .required('Template name is required')
    .min(2, 'Template name must be at least 2 characters')
    .max(100, 'Template name must not exceed 100 characters'),

  key: yup
    .string()
    .required('Template key is required')
    .min(2, 'Template key must be at least 2 characters')
    .max(50, 'Template key must not exceed 50 characters')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Template key can only contain letters, numbers, underscores, and hyphens'
    ),

  subject: yup
    .string()
    .required('Subject is required')
    .min(2, 'Subject must be at least 2 characters')
    .max(200, 'Subject must not exceed 200 characters'),

  body: yup
    .string()
    .required('Template body is required')
    .min(10, 'Template body must be at least 10 characters'),
});

export type TemplateFormData = yup.InferType<typeof templateValidationSchema>;
