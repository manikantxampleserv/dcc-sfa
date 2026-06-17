"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssetTypeValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createAssetTypeValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .isLength({ max: 100 })
        .withMessage('Name must be less than 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 255 })
        .withMessage('Description must be less than 255 characters'),
    (0, express_validator_1.body)('category')
        .optional()
        .isString()
        .withMessage('Category must be a string')
        .isLength({ max: 50 })
        .withMessage('Category must be less than 50 characters'),
    (0, express_validator_1.body)('brand')
        .optional()
        .isString()
        .withMessage('Brand must be a string')
        .isLength({ max: 100 })
        .withMessage('Brand must be less than 100 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=assetTypes.validation.js.map