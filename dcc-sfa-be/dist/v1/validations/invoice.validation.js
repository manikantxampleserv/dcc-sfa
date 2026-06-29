"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceValidation = exports.createInvoiceValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createInvoiceValidation = [
    (0, express_validator_1.body)('customer_id')
        .notEmpty()
        .withMessage('Customer ID is required')
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive integer'),
    (0, express_validator_1.body)('invoice_date')
        .notEmpty()
        .withMessage('Invoice date is required')
        .isISO8601()
        .withMessage('Invoice date must be a valid date'),
    (0, express_validator_1.body)('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
        .withMessage('Status must be one of: draft, sent, paid, overdue, cancelled'),
    (0, express_validator_1.body)('payment_method')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'])
        .withMessage('Payment method must be one of: cash, credit, debit, check, bank_transfer, online'),
    (0, express_validator_1.body)('parent_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Parent ID must be a positive integer'),
    (0, express_validator_1.body)('currency_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Currency ID must be a positive integer'),
    (0, express_validator_1.body)('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('subtotal')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Subtotal must be a non-negative number'),
    (0, express_validator_1.body)('discount_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount amount must be a non-negative number'),
    (0, express_validator_1.body)('tax_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Tax amount must be a non-negative number'),
    (0, express_validator_1.body)('shipping_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Shipping amount must be a non-negative number'),
    (0, express_validator_1.body)('total_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a non-negative number'),
    (0, express_validator_1.body)('amount_paid')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Amount paid must be a non-negative number'),
    (0, express_validator_1.body)('balance_due')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Balance due must be a non-negative number'),
    (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
    (0, express_validator_1.body)('billing_address')
        .optional()
        .isString()
        .withMessage('Billing address must be a string'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Is active must be Y or N'),
    (0, express_validator_1.body)('invoiceItems')
        .optional()
        .isArray()
        .withMessage('Invoice items must be an array'),
    (0, express_validator_1.body)('invoiceItems.*.product_id')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive integer'),
    (0, express_validator_1.body)('invoiceItems.*.quantity')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .isFloat({ min: 0.01 })
        .withMessage('Quantity must be a positive number'),
    (0, express_validator_1.body)('invoiceItems.*.unit_price')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .isFloat({ min: 0 })
        .withMessage('Unit price must be a non-negative number'),
    (0, express_validator_1.body)('invoiceItems.*.discount_amount')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount amount must be a non-negative number'),
    (0, express_validator_1.body)('invoiceItems.*.tax_amount')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Tax amount must be a non-negative number'),
    (0, express_validator_1.body)('invoiceItems.*.notes')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .optional()
        .isString()
        .withMessage('Notes must be a string'),
];
exports.updateInvoiceValidation = [
    (0, express_validator_1.body)('customer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive integer'),
    (0, express_validator_1.body)('invoice_date')
        .optional()
        .isISO8601()
        .withMessage('Invoice date must be a valid date'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
        .withMessage('Status must be one of: draft, sent, paid, overdue, cancelled'),
    (0, express_validator_1.body)('payment_method')
        .optional()
        .isIn(['cash', 'credit', 'debit', 'check', 'bank_transfer', 'online'])
        .withMessage('Payment method must be one of: cash, credit, debit, check, bank_transfer, online'),
    (0, express_validator_1.body)('parent_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Parent ID must be a positive integer'),
    (0, express_validator_1.body)('currency_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Currency ID must be a positive integer'),
    (0, express_validator_1.body)('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    (0, express_validator_1.body)('subtotal')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Subtotal must be a non-negative number'),
    (0, express_validator_1.body)('discount_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount amount must be a non-negative number'),
    (0, express_validator_1.body)('tax_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Tax amount must be a non-negative number'),
    (0, express_validator_1.body)('shipping_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Shipping amount must be a non-negative number'),
    (0, express_validator_1.body)('total_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a non-negative number'),
    (0, express_validator_1.body)('amount_paid')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Amount paid must be a non-negative number'),
    (0, express_validator_1.body)('balance_due')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Balance due must be a non-negative number'),
    (0, express_validator_1.body)('notes').optional().isString().withMessage('Notes must be a string'),
    (0, express_validator_1.body)('billing_address')
        .optional()
        .isString()
        .withMessage('Billing address must be a string'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Is active must be Y or N'),
    (0, express_validator_1.body)('invoiceItems')
        .optional()
        .isArray()
        .withMessage('Invoice items must be an array'),
    (0, express_validator_1.body)('invoiceItems.*.product_id')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .isInt({ min: 1 })
        .withMessage('Product ID must be a positive integer'),
    (0, express_validator_1.body)('invoiceItems.*.quantity')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .isFloat({ min: 0.01 })
        .withMessage('Quantity must be a positive number'),
    (0, express_validator_1.body)('invoiceItems.*.unit_price')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .isFloat({ min: 0 })
        .withMessage('Unit price must be a non-negative number'),
    (0, express_validator_1.body)('invoiceItems.*.discount_amount')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount amount must be a non-negative number'),
    (0, express_validator_1.body)('invoiceItems.*.tax_amount')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Tax amount must be a non-negative number'),
    (0, express_validator_1.body)('invoiceItems.*.notes')
        .if((0, express_validator_1.body)('invoiceItems').exists())
        .optional()
        .isString()
        .withMessage('Notes must be a string'),
];
//# sourceMappingURL=invoice.validation.js.map