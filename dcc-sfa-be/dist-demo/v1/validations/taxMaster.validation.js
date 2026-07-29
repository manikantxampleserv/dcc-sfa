"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxMasterValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createTaxMasterValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Tax name is required')
        .isString()
        .withMessage('Tax name must be a string')
        .isLength({ min: 2, max: 255 })
        .withMessage('Tax name must be between 2 and 255 characters'),
    (0, express_validator_1.body)('code')
        .notEmpty()
        .withMessage('Tax code is required')
        .isString()
        .withMessage('Tax code must be a string')
        .isLength({ min: 2, max: 100 })
        .withMessage('Tax code must be between 2 and 100 characters'),
    (0, express_validator_1.body)('tax_rate')
        .notEmpty()
        .withMessage('Tax rate is required')
        .isNumeric()
        .withMessage('Tax rate must be a number')
        .custom(value => {
        if (value < 0 || value > 100) {
            throw new Error('Tax rate must be between 0 and 100');
        }
        return true;
    }),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=taxMaster.validation.js.map