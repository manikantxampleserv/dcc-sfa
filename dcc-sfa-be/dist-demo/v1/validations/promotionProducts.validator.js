"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotionProductsValidations = void 0;
const express_validator_1 = require("express-validator");
exports.createPromotionProductsValidations = [
    (0, express_validator_1.body)('promotion_id').isInt().withMessage('promotion_id must be an integer'),
    (0, express_validator_1.body)('product_id').isInt().withMessage('product_id must be an integer'),
    (0, express_validator_1.body)('is_active').isString().withMessage('is_active must be a boolean'),
];
//# sourceMappingURL=promotionProducts.validator.js.map