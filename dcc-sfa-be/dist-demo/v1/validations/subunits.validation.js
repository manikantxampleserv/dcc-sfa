"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubunitValidation = exports.createSubunitValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createSubunitValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .isLength({ max: 255 })
        .withMessage('Name must not exceed 255 characters'),
    (0, express_validator_1.body)('code')
        .optional()
        .isString()
        .withMessage('Code must be a string')
        .isLength({ max: 100 })
        .withMessage('Code must not exceed 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('unit_of_measurement_id')
        .isInt({ min: 1 })
        .withMessage('Unit of measurement ID is required and must be a positive integer'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
    (0, express_validator_1.body)('log_inst')
        .optional()
        .isInt()
        .withMessage('Log instance must be a number'),
];
exports.updateSubunitValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .isString()
        .withMessage('Name must be a string')
        .isLength({ max: 255 })
        .withMessage('Name must not exceed 255 characters'),
    (0, express_validator_1.body)('code')
        .optional()
        .isString()
        .withMessage('Code must be a string')
        .isLength({ max: 100 })
        .withMessage('Code must not exceed 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('unit_of_measurement_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Unit of measurement ID must be a positive integer'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
    (0, express_validator_1.body)('log_inst')
        .optional()
        .isInt()
        .withMessage('Log instance must be a number'),
];
//# sourceMappingURL=subunits.validation.js.map