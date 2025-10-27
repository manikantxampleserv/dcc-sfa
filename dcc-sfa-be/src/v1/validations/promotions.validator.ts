import { body } from 'express-validator';

export const createPromotionsValidations = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('start_date').notEmpty().withMessage('Start Date is required'),
  body('end_date').notEmpty().withMessage('End Date is required'),
  body('depot_id').notEmpty().withMessage('Depot ID is required'),
  body('zone_id').notEmpty().withMessage('Zone ID is required'),
];
