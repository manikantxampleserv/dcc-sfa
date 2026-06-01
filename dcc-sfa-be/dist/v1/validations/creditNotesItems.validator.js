"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCreditNoteItemsValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createCreditNoteItemsValidator = [
    (0, express_validator_1.body)('parent_id').isInt().withMessage('parent_id must be an integer'),
    (0, express_validator_1.body)('product_id').isInt().withMessage('product_id must be an integer'),
    (0, express_validator_1.body)('quantity').isInt().withMessage('quantity must be an integer'),
    (0, express_validator_1.body)('unit_price').isFloat().withMessage('unit_price must be a float'),
    (0, express_validator_1.body)('discount_amount')
        .isFloat()
        .withMessage('discount_amount must be a float'),
    (0, express_validator_1.body)('tax_amount').isFloat().withMessage('tax_amount must be a float'),
    (0, express_validator_1.body)('total_amount').isFloat().withMessage('total_amount must be a float'),
    (0, express_validator_1.body)('notes').isString().withMessage('notes must be a string'),
];
//# sourceMappingURL=creditNotesItems.validator.js.map