"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoolerSubTypeValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCoolerSubTypeValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .isLength({ max: 255 })
        .withMessage('Name must be less than 255 characters'),
    (0, express_validator_1.body)('code')
        .optional()
        .isString()
        .withMessage('Code must be a string')
        .isLength({ max: 100 })
        .withMessage('Code must be less than 100 characters'),
    (0, express_validator_1.body)('cooler_type_id')
        .notEmpty()
        .withMessage('Cooler type is required')
        .isInt()
        .withMessage('Cooler type must be a valid integer'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=coolerSubTypes.validation.js.map