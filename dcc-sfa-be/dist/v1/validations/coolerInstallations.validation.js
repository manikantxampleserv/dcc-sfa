"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoolerInstallationValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCoolerInstallationValidation = [
    (0, express_validator_1.body)('customer_id')
        .notEmpty()
        .withMessage('Customer ID is required')
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive integer'),
    (0, express_validator_1.body)('code')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Cooler code must be a string')
        .custom(value => {
        if (value && value.trim() !== '') {
            if (value.length < 2 || value.length > 50) {
                throw new Error('Cooler code must be between 2 and 50 characters');
            }
        }
        return true;
    }),
    (0, express_validator_1.body)('brand')
        .optional()
        .isString()
        .withMessage('Brand must be a string')
        .isLength({ max: 100 })
        .withMessage('Brand must be less than 100 characters'),
    (0, express_validator_1.body)('model')
        .optional()
        .isString()
        .withMessage('Model must be a string')
        .isLength({ max: 100 })
        .withMessage('Model must be less than 100 characters'),
    (0, express_validator_1.body)('serial_number')
        .optional()
        .isString()
        .withMessage('Serial number must be a string')
        .isLength({ max: 100 })
        .withMessage('Serial number must be less than 100 characters'),
    (0, express_validator_1.body)('capacity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Capacity must be a non-negative integer'),
    (0, express_validator_1.body)('install_date')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Install date must be a valid date'),
    (0, express_validator_1.body)('last_service_date')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Last service date must be a valid date'),
    (0, express_validator_1.body)('next_service_due')
        .optional()
        .isISO8601()
        .withMessage('Next service due must be a valid date'),
    (0, express_validator_1.body)('next_inspection_due')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Next inspection due must be a valid date'),
    (0, express_validator_1.body)('status')
        .optional()
        .isString()
        .withMessage('Status must be a string')
        .isLength({ max: 20 })
        .withMessage('Status must be less than 20 characters'),
    (0, express_validator_1.body)('temperature')
        .optional()
        .isDecimal()
        .withMessage('Temperature must be a decimal number'),
    (0, express_validator_1.body)('energy_rating')
        .optional()
        .isString()
        .withMessage('Energy rating must be a string')
        .isLength({ max: 10 })
        .withMessage('Energy rating must be less than 10 characters'),
    (0, express_validator_1.body)('warranty_expiry')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Warranty expiry must be a valid date'),
    (0, express_validator_1.body)('maintenance_contract')
        .optional()
        .isString()
        .withMessage('Maintenance contract must be a string')
        .isLength({ max: 100 })
        .withMessage('Maintenance contract must be less than 100 characters'),
    (0, express_validator_1.body)('technician_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Technician ID must be a positive integer'),
    (0, express_validator_1.body)('last_scanned_date')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Last scanned date must be a valid date'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=coolerInstallations.validation.js.map