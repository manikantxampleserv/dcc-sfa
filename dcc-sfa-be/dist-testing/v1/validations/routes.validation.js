"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouteValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createRouteValidation = [
    (0, express_validator_1.body)('parent_id')
        .isInt()
        .withMessage('Parent ID is required and must be a number'),
    (0, express_validator_1.body)('depot_id')
        .isInt()
        .withMessage('Depot ID is required and must be a number'),
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('salesperson_id')
        .optional()
        .isInt()
        .withMessage('Salesperson ID must be a number'),
    (0, express_validator_1.body)('start_location')
        .optional()
        .isString()
        .withMessage('Start location must be a string'),
    (0, express_validator_1.body)('end_location')
        .optional()
        .isString()
        .withMessage('End location must be a string'),
    (0, express_validator_1.body)('estimated_distance')
        .optional()
        .isDecimal()
        .withMessage('Estimated distance must be a decimal'),
    (0, express_validator_1.body)('estimated_time')
        .optional()
        .isInt()
        .withMessage('Estimated time must be an integer (minutes)'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=routes.validation.js.map