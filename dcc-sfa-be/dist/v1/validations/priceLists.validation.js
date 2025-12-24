"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePriceListValidation = exports.createPriceListsValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createPriceListsValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Description cannot exceed 255 characters'),
    (0, express_validator_1.body)('currency_code')
        .optional()
        .isLength({ max: 10 })
        .withMessage('Currency code cannot exceed 10 characters'),
    (0, express_validator_1.body)('valid_from')
        .optional()
        .isISO8601()
        .withMessage('valid_from must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('valid_to')
        .optional()
        .isISO8601()
        .withMessage('valid_to must be a valid ISO 8601 date'),
];
exports.updatePriceListValidation = [...exports.createPriceListsValidation];
//# sourceMappingURL=priceLists.validation.js.map