"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCurrenciesValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCurrenciesValidation = [
    (0, express_validator_1.body)('name').notEmpty().isString().withMessage('Name is required'),
    (0, express_validator_1.body)('code').notEmpty().isString().withMessage('Code is required'),
    (0, express_validator_1.body)('symbol').optional().isString().withMessage('Symbol must be a string'),
    (0, express_validator_1.body)('is_active').notEmpty().isString().withMessage('Is active is required'),
];
//# sourceMappingURL=currencies.validation.js.map