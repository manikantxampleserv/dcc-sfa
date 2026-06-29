"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSalesTargetOverrideValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createSalesTargetOverrideValidation = [
    (0, express_validator_1.body)('sales_person_id').isInt().withMessage('Sales person ID is required'),
    (0, express_validator_1.body)('product_category_id')
        .isInt()
        .withMessage('Product category ID is required'),
    (0, express_validator_1.body)('target_quantity').isInt().withMessage('Target quantity is required'),
    (0, express_validator_1.body)('target_amount').isFloat().withMessage('Target amount is required'),
    (0, express_validator_1.body)('start_date').isDate().withMessage('Start date is required'),
    (0, express_validator_1.body)('end_date').isDate().withMessage('End date is required'),
    (0, express_validator_1.body)('is_active').isString().withMessage('Is active is required'),
];
//# sourceMappingURL=salesTargetOverrides.validation.js.map