"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSalesTargetGroupsValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createSalesTargetGroupsValidation = [
    (0, express_validator_1.body)('sales_target_id').notEmpty().withMessage('Sales Target is required'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=salesTargetGroups.validation.js.map