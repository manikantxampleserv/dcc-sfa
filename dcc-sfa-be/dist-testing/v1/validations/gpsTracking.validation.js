"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGPSLogValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createGPSLogValidation = [
    (0, express_validator_1.body)('latitude')
        .notEmpty()
        .withMessage('Latitude is required')
        .isDecimal()
        .withMessage('Latitude must be a valid decimal number')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.body)('longitude')
        .notEmpty()
        .withMessage('Longitude is required')
        .isDecimal()
        .withMessage('Longitude must be a valid decimal number')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.body)('accuracy_meters')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Accuracy must be a positive integer'),
    (0, express_validator_1.body)('speed_kph')
        .optional()
        .isDecimal()
        .withMessage('Speed must be a valid decimal number')
        .isFloat({ min: 0 })
        .withMessage('Speed must be a positive number'),
    (0, express_validator_1.body)('battery_level')
        .optional()
        .isDecimal()
        .withMessage('Battery level must be a valid decimal number')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Battery level must be between 0 and 100'),
    (0, express_validator_1.body)('network_type')
        .optional()
        .isString()
        .withMessage('Network type must be a string')
        .isLength({ max: 20 })
        .withMessage('Network type must be less than 20 characters'),
    (0, express_validator_1.body)('log_time')
        .optional()
        .isISO8601()
        .withMessage('Log time must be a valid ISO 8601 date string'),
];
//# sourceMappingURL=gpsTracking.validation.js.map