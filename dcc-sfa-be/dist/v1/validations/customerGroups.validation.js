"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerGroupsValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCustomerGroupsValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .isLength({ max: 255 })
        .withMessage('Name cannot exceed 255 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('discount_percentage')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount percentage must be a positive number'),
    (0, express_validator_1.body)('credit_terms')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Credit terms must be a positive integer'),
    (0, express_validator_1.body)('payment_terms')
        .optional()
        .isString()
        .withMessage('Payment terms must be a string')
        .isLength({ max: 100 })
        .withMessage('Payment terms cannot exceed 100 characters'),
    (0, express_validator_1.body)('price_group')
        .optional()
        .isString()
        .withMessage('Price group must be a string')
        .isLength({ max: 50 })
        .withMessage('Price group cannot exceed 50 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be either "Y" or "N"'),
];
//# sourceMappingURL=customerGroups.validation.js.map