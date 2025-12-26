"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVanInventoryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createVanInventoryValidation = [
    (0, express_validator_1.body)('user_id').isInt().withMessage('User ID is required'),
    // body('product_id').isInt().withMessage('Product ID is required'),
    (0, express_validator_1.body)('batch_id')
        .optional()
        .custom(value => {
        if (value === null || value === undefined || value === '') {
            return true;
        }
        return Number.isInteger(Number(value));
    })
        .withMessage('Batch ID must be an integer'),
    (0, express_validator_1.body)('serial_no_id')
        .optional()
        .custom(value => {
        if (value === null || value === undefined || value === '') {
            return true;
        }
        return Number.isInteger(Number(value));
    })
        .withMessage('Serial No ID must be an integer'),
    (0, express_validator_1.body)('vehicle_id')
        .optional()
        .custom(value => {
        if (value === null || value === undefined || value === '') {
            return true;
        }
        return Number.isInteger(Number(value));
    })
        .withMessage('Vehicle ID must be an integer'),
    (0, express_validator_1.body)('location_type')
        .optional()
        .isString()
        .withMessage('Location Type must be a string'),
    (0, express_validator_1.body)('is_active').isString().withMessage('Is Active must be a string'),
];
//# sourceMappingURL=vanInventory.validation.js.map