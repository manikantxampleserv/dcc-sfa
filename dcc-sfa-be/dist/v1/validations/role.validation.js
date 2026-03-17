"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRole = void 0;
const express_validator_1 = require("express-validator");
exports.validateRole = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Role name is required')
        .isLength({ min: 3 })
        .withMessage('Role name must be at least 3 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage("is_active must be either 'Y' or 'N'"),
];
//# sourceMappingURL=role.validation.js.map