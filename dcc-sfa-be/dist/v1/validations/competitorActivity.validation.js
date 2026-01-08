"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompetitorActivityValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCompetitorActivityValidation = [
    (0, express_validator_1.body)('customer_id')
        .notEmpty()
        .withMessage('Customer ID is required')
        .isInt({ min: 1 })
        .withMessage('Customer ID must be a positive integer'),
    (0, express_validator_1.body)('visit_id')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('Visit ID must be a positive integer'),
    (0, express_validator_1.body)('brand_name')
        .notEmpty()
        .withMessage('Brand name is required')
        .isString()
        .withMessage('Brand name must be a string')
        .isLength({ max: 255 })
        .withMessage('Brand name must be less than 255 characters'),
    (0, express_validator_1.body)('product_name')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Product name must be a string')
        .isLength({ max: 255 })
        .withMessage('Product name must be less than 255 characters'),
    (0, express_validator_1.body)('observed_price')
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Observed price must be a positive number'),
    (0, express_validator_1.body)('promotion_details')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Promotion details must be a string')
        .isLength({ max: 1000 })
        .withMessage('Promotion details must be less than 1000 characters'),
    (0, express_validator_1.body)('visibility_score')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 100 })
        .withMessage('Visibility score must be between 0 and 100'),
    (0, express_validator_1.body)('image_url')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('Image URL must be a valid URL')
        .isLength({ max: 500 })
        .withMessage('Image URL must be less than 500 characters'),
    (0, express_validator_1.body)('remarks')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Remarks must be a string')
        .isLength({ max: 1000 })
        .withMessage('Remarks must be less than 1000 characters'),
    (0, express_validator_1.body)('is_active')
        .optional({ checkFalsy: true })
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=competitorActivity.validation.js.map