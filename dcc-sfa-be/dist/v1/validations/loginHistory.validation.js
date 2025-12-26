"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoginHistoryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createLoginHistoryValidation = [
    (0, express_validator_1.body)('user_id')
        .notEmpty()
        .withMessage('User ID is required')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive integer'),
    (0, express_validator_1.body)('login_time')
        .optional()
        .isISO8601()
        .withMessage('Login time must be a valid date'),
    (0, express_validator_1.body)('logout_time')
        .optional()
        .isISO8601()
        .withMessage('Logout time must be a valid date'),
    (0, express_validator_1.body)('ip_address')
        .optional()
        .isString()
        .withMessage('IP address must be a string')
        .isLength({ max: 50 })
        .withMessage('IP address must be less than 50 characters'),
    (0, express_validator_1.body)('device_info')
        .optional()
        .isString()
        .withMessage('Device info must be a string')
        .isLength({ max: 255 })
        .withMessage('Device info must be less than 255 characters'),
    (0, express_validator_1.body)('os_info')
        .optional()
        .isString()
        .withMessage('OS info must be a string')
        .isLength({ max: 100 })
        .withMessage('OS info must be less than 100 characters'),
    (0, express_validator_1.body)('app_version')
        .optional()
        .isString()
        .withMessage('App version must be a string')
        .isLength({ max: 50 })
        .withMessage('App version must be less than 50 characters'),
    (0, express_validator_1.body)('location_latitude')
        .optional()
        .isDecimal()
        .withMessage('Location latitude must be a decimal number'),
    (0, express_validator_1.body)('location_longitude')
        .optional()
        .isDecimal()
        .withMessage('Location longitude must be a decimal number'),
    (0, express_validator_1.body)('login_status')
        .optional()
        .isIn(['success', 'failed'])
        .withMessage('Login status must be either success or failed'),
    (0, express_validator_1.body)('failure_reason')
        .optional()
        .isString()
        .withMessage('Failure reason must be a string')
        .isLength({ max: 255 })
        .withMessage('Failure reason must be less than 255 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=loginHistory.validation.js.map