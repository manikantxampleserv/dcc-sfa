"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePriceListItemsValidation = exports.createPriceListItemsValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createPriceListItemsValidation = [
    (0, express_validator_1.body)('pricelist_id')
        .exists()
        .withMessage('pricelist_id is required')
        .isInt({ gt: 0 })
        .withMessage('pricelist_id must be a positive integer'),
    (0, express_validator_1.body)('product_id')
        .exists()
        .withMessage('product_id is required')
        .isInt({ gt: 0 })
        .withMessage('product_id must be a positive integer'),
    (0, express_validator_1.body)('unit_price')
        .exists()
        .withMessage('unit_price is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('unit_price must be a decimal with max 2 decimal places'),
    (0, express_validator_1.body)('uom').optional().isString().withMessage('uom must be a string'),
    (0, express_validator_1.body)('discount_percent')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('discount_percent must be a decimal'),
    (0, express_validator_1.body)('effective_from')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('effective_from must be a valid date'),
    (0, express_validator_1.body)('effective_to')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('effective_to must be a valid date'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
exports.updatePriceListItemsValidation = [
    ...exports.createPriceListItemsValidation,
];
//# sourceMappingURL=priceListItems.validation.js.map