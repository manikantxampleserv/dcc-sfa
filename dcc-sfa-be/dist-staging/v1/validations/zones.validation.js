"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createZoneValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createZoneValidation = [
    (0, express_validator_1.body)('parent_id')
        .isInt()
        .withMessage('Parent ID is required and must be a number'),
    (0, express_validator_1.body)('depot_id').optional().isInt().withMessage('Depot ID must be a number'),
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('supervisor_id')
        .optional()
        .isInt()
        .withMessage('Supervisor ID must be a number'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
    (0, express_validator_1.body)('joining_date')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Joining date must be a valid date'),
];
//# sourceMappingURL=zones.validation.js.map