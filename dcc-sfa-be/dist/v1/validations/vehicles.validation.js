"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVehicleValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createVehicleValidation = [
    (0, express_validator_1.body)('vehicle_number')
        .notEmpty()
        .withMessage('Vehicle number is required')
        .isString()
        .withMessage('Vehicle number must be a string')
        .isLength({ max: 20 })
        .withMessage('Vehicle number must be less than 20 characters'),
    (0, express_validator_1.body)('type')
        .notEmpty()
        .withMessage('Vehicle type is required')
        .isString()
        .withMessage('Type must be a string')
        .isLength({ max: 20 })
        .withMessage('Type must be less than 20 characters'),
    (0, express_validator_1.body)('make')
        .optional()
        .isString()
        .withMessage('Make must be a string')
        .isLength({ max: 50 })
        .withMessage('Make must be less than 50 characters'),
    (0, express_validator_1.body)('model')
        .optional()
        .isString()
        .withMessage('Model must be a string')
        .isLength({ max: 50 })
        .withMessage('Model must be less than 50 characters'),
    (0, express_validator_1.body)('year')
        .optional()
        .isInt({ min: 1900, max: 2100 })
        .withMessage('Year must be between 1900 and 2100'),
    (0, express_validator_1.body)('capacity')
        .optional()
        .isDecimal()
        .withMessage('Capacity must be a decimal number'),
    (0, express_validator_1.body)('fuel_type')
        .optional()
        .isString()
        .withMessage('Fuel type must be a string')
        .isLength({ max: 20 })
        .withMessage('Fuel type must be less than 20 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isString()
        .withMessage('Status must be a string')
        .isLength({ max: 20 })
        .withMessage('Status must be less than 20 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=vehicles.validation.js.map