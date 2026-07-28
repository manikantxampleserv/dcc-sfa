"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitMeasurementValidation = void 0;
const express_validator_1 = require("express-validator");
exports.unitMeasurementValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('description').optional(),
    (0, express_validator_1.body)('category').optional(),
    (0, express_validator_1.body)('symbol').optional(),
    (0, express_validator_1.body)('is_active').optional(),
];
//# sourceMappingURL=unitMeasurement.validation.js.map