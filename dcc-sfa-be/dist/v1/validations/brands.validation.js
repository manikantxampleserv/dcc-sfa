"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrandValidation = exports.createBrandValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createBrandValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Brand name is required'),
    (0, express_validator_1.body)('code').notEmpty().withMessage('Brand code is required'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be either "Y" or "N"'),
];
exports.updateBrandValidation = [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Brand name cannot be empty'),
    (0, express_validator_1.body)('code').optional().notEmpty().withMessage('Brand code cannot be empty'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be either "Y" or "N"'),
];
//# sourceMappingURL=brands.validation.js.map