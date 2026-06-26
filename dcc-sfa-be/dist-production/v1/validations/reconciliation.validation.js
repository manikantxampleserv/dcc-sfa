"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveReconciliationValidation = void 0;
const express_validator_1 = require("express-validator");
exports.saveReconciliationValidation = [
    (0, express_validator_1.body)('items')
        .isArray({ min: 1 })
        .withMessage('items must be a non-empty array'),
    (0, express_validator_1.body)('items.*.id')
        .isInt()
        .withMessage('Item ID must be an integer'),
    (0, express_validator_1.body)('items.*.actual_qty')
        .optional({ nullable: true })
        .isNumeric()
        .withMessage('Actual Quantity must be a number'),
];
//# sourceMappingURL=reconciliation.validation.js.map