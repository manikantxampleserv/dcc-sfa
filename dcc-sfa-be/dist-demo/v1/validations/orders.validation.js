"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createOrderValidation = [
    (0, express_validator_1.body)('parent_id').notEmpty().withMessage('Parent ID is required'),
    (0, express_validator_1.body)('salesperson_id').notEmpty().withMessage('SalesPerson ID is required'),
    (0, express_validator_1.body)('is_active')
        .notEmpty()
        .isIn(['Y', 'N'])
        .notEmpty()
        .withMessage('Is active must be Y or N'),
];
//# sourceMappingURL=orders.validation.js.map