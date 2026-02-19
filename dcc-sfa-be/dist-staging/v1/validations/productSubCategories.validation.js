"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSubCategoriesValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createProductSubCategoriesValidation = [
    (0, express_validator_1.body)('sub_category_name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('product_category_id')
        .notEmpty()
        .withMessage('Product Category ID is required'),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('is_active').optional().isIn(['Y', 'N']).withMessage('Invalid status'),
];
//# sourceMappingURL=productSubCategories.validation.js.map