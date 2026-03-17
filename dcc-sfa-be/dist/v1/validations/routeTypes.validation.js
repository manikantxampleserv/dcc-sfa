"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRouteTypeValidation = exports.createRouteTypeValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createRouteTypeValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Route type name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Route type name must be between 1 and 100 characters')
        .trim(),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Status must be Y or N'),
];
exports.updateRouteTypeValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Route type name must be between 1 and 100 characters')
        .trim(),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Status must be Y or N'),
];
//# sourceMappingURL=routeTypes.validation.js.map