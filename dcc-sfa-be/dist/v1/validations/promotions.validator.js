"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotionsValidations = void 0;
const express_validator_1 = require("express-validator");
exports.createPromotionsValidations = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('start_date').notEmpty().withMessage('Start Date is required'),
    (0, express_validator_1.body)('end_date').notEmpty().withMessage('End Date is required'),
    (0, express_validator_1.body)('depot_id').notEmpty().withMessage('Depot ID is required'),
    (0, express_validator_1.body)('zone_id').notEmpty().withMessage('Zone ID is required'),
];
//# sourceMappingURL=promotions.validator.js.map