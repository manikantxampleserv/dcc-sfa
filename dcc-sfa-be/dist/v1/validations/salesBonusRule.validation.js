"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSalesBonusRuleValidation = exports.createSalesBonusRuleValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createSalesBonusRuleValidation = [
    (0, express_validator_1.body)('sales_target_id')
        .notEmpty()
        .withMessage('Sales Target is required')
        .isInt()
        .withMessage('Sales Target ID must be a number'),
    (0, express_validator_1.body)('achievement_min_percent')
        .notEmpty()
        .withMessage('Minimum achievement percent is required')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Minimum achievement percent must be between 0 and 100'),
    (0, express_validator_1.body)('achievement_max_percent')
        .notEmpty()
        .withMessage('Maximum achievement percent is required')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Maximum achievement percent must be between 0 and 100'),
    (0, express_validator_1.body)('bonus_amount')
        .notEmpty()
        .withMessage('Bonus amount is required')
        .isFloat({ min: 0 })
        .withMessage('Bonus amount must be a positive number'),
    (0, express_validator_1.body)('bonus_percent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Bonus percent must be between 0 and 100'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Status must be Y or N'),
];
exports.updateSalesBonusRuleValidation = [
    (0, express_validator_1.body)('sales_target_id')
        .optional()
        .isInt()
        .withMessage('Sales Target ID must be a number'),
    (0, express_validator_1.body)('achievement_min_percent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Minimum achievement percent must be between 0 and 100'),
    (0, express_validator_1.body)('achievement_max_percent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Maximum achievement percent must be between 0 and 100'),
    (0, express_validator_1.body)('bonus_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Bonus amount must be a positive number'),
    (0, express_validator_1.body)('bonus_percent')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Bonus percent must be between 0 and 100'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Status must be Y or N'),
];
//# sourceMappingURL=salesBonusRule.validation.js.map