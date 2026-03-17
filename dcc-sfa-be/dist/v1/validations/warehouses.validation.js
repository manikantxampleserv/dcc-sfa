"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWarehouseValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createWarehouseValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .isLength({ max: 100 })
        .withMessage('Name must be less than 100 characters'),
    (0, express_validator_1.body)('type')
        .optional()
        .isString()
        .withMessage('Type must be a string')
        .isLength({ max: 50 })
        .withMessage('Type must be less than 50 characters'),
    (0, express_validator_1.body)('location')
        .optional()
        .isString()
        .withMessage('Location must be a string')
        .isLength({ max: 255 })
        .withMessage('Location must be less than 255 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=warehouses.validation.js.map