import { body } from 'express-validator';

export const createStockTransferRequestValidation = [
  body('source_type').notEmpty().withMessage('Source type is required'),
  body('source_id').notEmpty().withMessage('Source ID is required'),
  body('destination_type')
    .notEmpty()
    .withMessage('Destination type is required'),
  body('destination_id')
    .notEmpty()
    .withMessage('Destination ID is required')
    .custom((value, { req }) => {
      if (value === req.body.source_id) {
        throw new Error('Source and destination cannot be the same');
      }
      return true;
    }),
  body('requested_by').notEmpty().withMessage('Requested by is required'),
  body('stock_transfer_lines')
    .notEmpty()
    .withMessage('Stock transfer lines is required'),
];
