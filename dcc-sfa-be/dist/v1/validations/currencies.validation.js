"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCurrenciesValidation = void 0;
const express_validator_1 = require("express-validator");
const prisma_client_1 = require("../../configs/prisma.client");
const checkDuplicateCurrencyCode = async (value) => {
    const prisma = (0, prisma_client_1.getPrisma)();
    const existingCurrency = await prisma.currencies.findUnique({
        where: { code: value.toUpperCase() },
    });
    return !existingCurrency;
};
exports.createCurrenciesValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .isString()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('code')
        .notEmpty()
        .isString()
        .isLength({ min: 3, max: 10 })
        .matches(/^[A-Z]{3}$/)
        .withMessage('Code must be exactly 3 uppercase letters (e.g., USD, EUR, GBP)')
        .custom(checkDuplicateCurrencyCode)
        .withMessage('Currency with this code already exists'),
    (0, express_validator_1.body)('symbol')
        .optional()
        .isString()
        .isLength({ max: 10 })
        .withMessage('Symbol must be a string with maximum 10 characters'),
    (0, express_validator_1.body)('exchange_rate_to_base')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Exchange rate must be a positive number'),
    (0, express_validator_1.body)('is_base')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Is base must be either Y or N'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Is active must be either Y or N'),
];
//# sourceMappingURL=currencies.validation.js.map