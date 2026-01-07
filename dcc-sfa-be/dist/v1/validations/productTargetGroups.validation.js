"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductTargetGroupValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createProductTargetGroupValidation = [
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
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=productTargetGroups.validation.js.map