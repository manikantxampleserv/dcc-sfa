"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnRequestsValidation = void 0;
const express_validator_1 = require("express-validator");
exports.returnRequestsValidation = [
    (0, express_validator_1.body)('customer_id').isInt().withMessage('Customer ID is required'),
    (0, express_validator_1.body)('product_id').isInt().withMessage('Product ID is required'),
    (0, express_validator_1.body)('serial_id')
        .optional()
        .isInt()
        .withMessage('Serial ID must be an integer'),
    (0, express_validator_1.body)('return_date').isDate().withMessage('Return date must be a valid date'),
    (0, express_validator_1.body)('reason').optional().isString().withMessage('Reason must be a string'),
    (0, express_validator_1.body)('status').optional().isString().withMessage('Status must be a string'),
    (0, express_validator_1.body)('approved_by')
        .optional()
        .isInt()
        .withMessage('Approved by must be an integer'),
    (0, express_validator_1.body)('approved_date')
        .optional()
        .isDate()
        .withMessage('Approved date must be a valid date'),
    (0, express_validator_1.body)('resolution_notes')
        .optional()
        .isString()
        .withMessage('Resolution notes must be a string'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isString()
        .withMessage('Is active must be a string'),
];
//# sourceMappingURL=returnRequests.validation.js.map