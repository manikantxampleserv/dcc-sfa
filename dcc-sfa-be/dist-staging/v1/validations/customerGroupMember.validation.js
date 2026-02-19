"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerGroupMemberValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCustomerGroupMemberValidation = [
    (0, express_validator_1.body)('customer_group_id')
        .notEmpty()
        .withMessage('Customer group ID is required')
        .isInt({ min: 1 })
        .withMessage('Customer group ID must be a positive integer'),
    (0, express_validator_1.body)('customer_id')
        .notEmpty()
        .withMessage('Customer ID is required')
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive integer'),
    (0, express_validator_1.body)('joined_at')
        .optional()
        .isISO8601()
        .withMessage('joined_at must be a valid ISO date'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be either "Y" or "N"'),
];
//# sourceMappingURL=customerGroupMember.validation.js.map