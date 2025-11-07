/**
 * @fileoverview Route Validation Schema
 * @description Yup validation schemas for route forms
 * @author DCC-SFA Team
 * @version 1.0.0
 */

import * as yup from 'yup';

export const routeValidationSchema = yup.object({
  parent_id: yup
    .string()
    .required('Zone is required')
    .test('is-number', 'Zone must be a valid selection', value => {
      return value ? !isNaN(Number(value)) : false;
    }),

  depot_id: yup
    .string()
    .required('Depot is required')
    .test('is-number', 'Depot must be a valid selection', value => {
      return value ? !isNaN(Number(value)) : false;
    }),

  route_type_id: yup
    .string()
    .required('Route type is required')
    .test('is-number', 'Route type must be a valid selection', value => {
      return value ? !isNaN(Number(value)) : false;
    }),

  name: yup
    .string()
    .required('Route name is required')
    .min(2, 'Route name must be at least 2 characters')
    .max(100, 'Route name must not exceed 100 characters')
    .trim(),

  description: yup
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim(),

  salesperson_id: yup
    .string()
    .test(
      'is-number-or-empty',
      'Salesperson must be a valid selection',
      value => {
        return !value || !isNaN(Number(value));
      }
    ),

  start_location: yup
    .string()
    .max(200, 'Start location must not exceed 200 characters')
    .trim(),

  end_location: yup
    .string()
    .max(200, 'End location must not exceed 200 characters')
    .trim(),

  estimated_distance: yup
    .string()
    .test(
      'is-positive-number-or-empty',
      'Distance must be a positive number',
      value => {
        if (!value) return true;
        const num = Number(value);
        return !isNaN(num) && num > 0;
      }
    ),

  estimated_time: yup
    .string()
    .test(
      'is-positive-integer-or-empty',
      'Time must be a positive integer',
      value => {
        if (!value) return true;
        const num = Number(value);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
      }
    ),

  is_active: yup
    .string()
    .required('Status is required')
    .oneOf(['Y', 'N'], 'Status must be either Active or Inactive'),
});
