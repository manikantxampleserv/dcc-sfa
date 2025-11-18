import { body, ValidationChain } from 'express-validator';

const validateComplaintFields = () => [
  body('customer_id').isInt().withMessage('Customer ID is required'),
  body('complaint_description')
    .notEmpty()
    .withMessage('Complaint description is required'),
  body('status').isIn(['P', 'R', 'C']).withMessage('Status must be P, R, or C'),
  body('submitted_by').isInt().withMessage('Submitted by is required'),
];

export const createCustomerComplaintsValidation: ValidationChain[] = [
  body().custom((value, { req }) => {
    if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
      throw new Error('Request body cannot be empty');
    }
    return true;
  }),

  // Validate array items
  body('*')
    .if(body().isArray())
    .isObject()
    .withMessage('Each item must be an object'),
  body('*.customer_id')
    .if(body().isArray())
    .isInt()
    .withMessage('Customer ID is required'),
  body('*.complaint_description')
    .if(body().isArray())
    .notEmpty()
    .withMessage('Complaint description is required'),
  body('*.status')
    .if(body().isArray())
    .isIn(['P', 'R', 'C'])
    .withMessage('Status must be P, R, or C'),
  body('*.submitted_by')
    .if(body().isArray())
    .isInt()
    .withMessage('Submitted by is required'),

  body('customer_id')
    .if(body().isObject())
    .isInt()
    .withMessage('Customer ID is required'),
  body('complaint_description')
    .if(body().isObject())
    .notEmpty()
    .withMessage('Complaint description is required'),
  body('status')
    .if(body().isObject())
    .isIn(['P', 'R', 'C'])
    .withMessage('Status must be P, R, or C'),
  body('submitted_by')
    .if(body().isObject())
    .isInt()
    .withMessage('Submitted by is required'),
];
