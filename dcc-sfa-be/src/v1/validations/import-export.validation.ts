import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ImportExportFactory } from '../services//import-export-factory.service';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const validateTableParam = [
  param('table')
    .notEmpty()
    .withMessage('Table name is required')
    .isString()
    .withMessage('Table name must be a string')
    .matches(/^[a-z_]+$/)
    .withMessage(
      'Table name must contain only lowercase letters and underscores'
    )
    .isLength({ max: 50 })
    .withMessage('Table name must not exceed 50 characters')
    .custom(value => {
      const supportedTables = ImportExportFactory.getSupportedTables();
      if (!supportedTables.includes(value)) {
        throw new Error(
          `Table '${value}' is not supported. Supported tables: ${supportedTables.join(', ')}`
        );
      }
      return true;
    }),
];

export const validateExportQuery = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters')
    .trim()
    .escape(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Limit must be between 1 and 10000')
    .toInt(),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('sortField')
    .optional()
    .isString()
    .withMessage('Sort field must be a string')
    .isIn(['id', 'name', 'code', 'email', 'createdate', 'updatedate'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('Sort order must be asc or desc')
    .toLowerCase(),
];

export const validateImportBody = [
  body('batchSize')
    .optional()
    .isInt({ min: 10, max: 1000 })
    .withMessage('Batch size must be between 10 and 1000')
    .toInt(),

  body('skipDuplicates')
    .optional()
    .isBoolean()
    .withMessage('skipDuplicates must be a boolean')
    .toBoolean(),

  body('updateExisting')
    .optional()
    .isBoolean()
    .withMessage('updateExisting must be a boolean')
    .toBoolean(),
];

export const validateFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
      errors: [{ msg: 'File is required', param: 'file' }],
    });
  }

  const fileSize = req.file.size;
  const fileName = req.file.originalname;
  const fileExt = fileName.split('.').pop()?.toLowerCase();

  if (!['xlsx', 'xls', 'csv'].includes(fileExt || '')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file extension',
      errors: [{ msg: 'File must be .xlsx, .xls, or .csv', param: 'file' }],
    });
  }

  if (fileSize === 0) {
    return res.status(400).json({
      success: false,
      message: 'File is empty',
      errors: [{ msg: 'Uploaded file is empty', param: 'file' }],
    });
  }

  next();
};

export const validateTemplate = [...validateTableParam, handleValidationErrors];

export const validatePreview = [
  ...validateTableParam,
  handleValidationErrors,
  validateFile,
];

export const validateImport = [
  ...validateTableParam,
  ...validateImportBody,
  handleValidationErrors,
  validateFile,
];

export const validateExport = [
  ...validateTableParam,
  ...validateExportQuery,
  handleValidationErrors,
];
