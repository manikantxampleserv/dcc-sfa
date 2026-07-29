"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateExport = exports.validateImport = exports.validatePreview = exports.validateTemplate = exports.validateFile = exports.validateImportBody = exports.validateExportQuery = exports.validateTableParam = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const import_export_factory_service_1 = require("../services//import-export-factory.service");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateTableParam = [
    (0, express_validator_1.param)('table')
        .notEmpty()
        .withMessage('Table name is required')
        .isString()
        .withMessage('Table name must be a string')
        .matches(/^[a-z_]+$/)
        .withMessage('Table name must contain only lowercase letters and underscores')
        .isLength({ max: 50 })
        .withMessage('Table name must not exceed 50 characters')
        .custom(value => {
        const supportedTables = import_export_factory_service_1.ImportExportFactory.getSupportedTables();
        if (!supportedTables.includes(value)) {
            throw new Error(`Table '${value}' is not supported. Supported tables: ${supportedTables.join(', ')}`);
        }
        return true;
    }),
];
exports.validateExportQuery = [
    (0, express_validator_1.query)('search')
        .optional()
        .isString()
        .withMessage('Search must be a string')
        .isLength({ max: 100 })
        .withMessage('Search query must not exceed 100 characters')
        .trim()
        .escape(),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 10000 })
        .withMessage('Limit must be between 1 and 10000')
        .toInt(),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),
    (0, express_validator_1.query)('sortField')
        .optional()
        .isString()
        .withMessage('Sort field must be a string')
        .isIn(['id', 'name', 'code', 'email', 'createdate', 'updatedate'])
        .withMessage('Invalid sort field'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['asc', 'desc', 'ASC', 'DESC'])
        .withMessage('Sort order must be asc or desc')
        .toLowerCase(),
];
exports.validateImportBody = [
    (0, express_validator_1.body)('batchSize')
        .optional()
        .isInt({ min: 10, max: 1000 })
        .withMessage('Batch size must be between 10 and 1000')
        .toInt(),
    (0, express_validator_1.body)('skipDuplicates')
        .optional()
        .isBoolean()
        .withMessage('skipDuplicates must be a boolean')
        .toBoolean(),
    (0, express_validator_1.body)('updateExisting')
        .optional()
        .isBoolean()
        .withMessage('updateExisting must be a boolean')
        .toBoolean(),
];
const validateFile = (req, res, next) => {
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
exports.validateFile = validateFile;
exports.validateTemplate = [...exports.validateTableParam, exports.handleValidationErrors];
exports.validatePreview = [
    ...exports.validateTableParam,
    exports.handleValidationErrors,
    exports.validateFile,
];
exports.validateImport = [
    ...exports.validateTableParam,
    ...exports.validateImportBody,
    exports.handleValidationErrors,
    exports.validateFile,
];
exports.validateExport = [
    ...exports.validateTableParam,
    ...exports.validateExportQuery,
    exports.handleValidationErrors,
];
//# sourceMappingURL=import-export.validation.js.map