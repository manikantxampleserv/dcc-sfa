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
];
exports.updatePriceListValidation = [...exports.createPriceListsValidation];
//# sourceMappingURL=priceLists.validation.js.map