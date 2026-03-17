"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotionParametersValidations = void 0;
const express_validator_1 = require("express-validator");
exports.createPromotionParametersValidations = [
    (0, express_validator_1.body)('promotion_id').isInt().withMessage('promotion_id must be an integer'),
    (0, express_validator_1.body)('param_name').isString().withMessage('param_name must be a string'),
    (0, express_validator_1.body)('param_type').isString().withMessage('param_type must be a string'),
    (0, express_validator_1.body)('param_value')
        .optional()
        .isString()
        .withMessage('param_value must be a string'),
    (0, express_validator_1.body)('param_category')
        .isString()
        .withMessage('param_category must be a string'),
    (0, express_validator_1.body)('is_active').isString().withMessage('is_active must be a string'),
];
//# sourceMappingURL=promotionParameters.validator.js.map