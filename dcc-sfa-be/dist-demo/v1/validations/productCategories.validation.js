"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductCategoriesValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createProductCategoriesValidation = [
    (0, express_validator_1.body)('category_name').notEmpty().withMessage('Category name is required'),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('is_active').optional().isIn(['Y', 'N']).withMessage('Invalid status'),
];
//# sourceMappingURL=productCategories.validation.js.map