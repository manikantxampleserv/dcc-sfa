"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCreditNotesValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createCreditNotesValidator = [
    (0, express_validator_1.body)('parent_id').notEmpty().withMessage('Parent ID is required'),
    (0, express_validator_1.body)('customer_id').notEmpty().withMessage('Customer ID is required'),
    (0, express_validator_1.body)('credit_note_date')
        .notEmpty()
        .withMessage('Credit Note Date is required'),
    (0, express_validator_1.body)('due_date').notEmpty().withMessage('Due Date is required'),
    (0, express_validator_1.body)('status').notEmpty().withMessage('Status is required'),
    (0, express_validator_1.body)('reason').notEmpty().withMessage('Reason is required'),
    (0, express_validator_1.body)('payment_method').notEmpty().withMessage('Payment Method is required'),
    (0, express_validator_1.body)('subtotal').notEmpty().withMessage('Subtotal is required'),
    (0, express_validator_1.body)('discount_amount').notEmpty().withMessage('Discount Amount is required'),
    (0, express_validator_1.body)('tax_amount').notEmpty().withMessage('Tax Amount is required'),
    (0, express_validator_1.body)('shipping_amount').notEmpty().withMessage('Shipping Amount is required'),
    (0, express_validator_1.body)('total_amount').notEmpty().withMessage('Total Amount is required'),
    (0, express_validator_1.body)('amount_applied').notEmpty().withMessage('Amount Applied is required'),
    (0, express_validator_1.body)('balance_due').notEmpty().withMessage('Balance Due is required'),
    (0, express_validator_1.body)('notes').optional(),
    (0, express_validator_1.body)('billing_address').optional(),
    (0, express_validator_1.body)('is_active').optional(),
    (0, express_validator_1.body)('currency_id').notEmpty().withMessage('Currency ID is required'),
];
//# sourceMappingURL=creditNotes.validator.js.map