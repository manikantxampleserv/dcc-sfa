"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoolerInspectionValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCoolerInspectionValidation = [
    (0, express_validator_1.body)('cooler_id')
        .notEmpty()
        .withMessage('Cooler ID is required')
        .isInt({ min: 1 })
        .withMessage('Cooler ID must be a positive integer'),
    (0, express_validator_1.body)('inspected_by')
        .notEmpty()
        .withMessage('Inspector ID is required')
        .isInt({ min: 1 })
        .withMessage('Inspector ID must be a positive integer'),
    (0, express_validator_1.body)('visit_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Visit ID must be a positive integer'),
    (0, express_validator_1.body)('inspection_date')
        .optional()
        .isISO8601()
        .withMessage('Inspection date must be a valid date'),
    (0, express_validator_1.body)('temperature')
        .optional()
        .isDecimal()
        .withMessage('Temperature must be a decimal number'),
    (0, express_validator_1.body)('is_working')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_working must be Y or N'),
    (0, express_validator_1.body)('issues')
        .optional()
        .isString()
        .withMessage('Issues must be a string')
        .isLength({ max: 2000 })
        .withMessage('Issues must be less than 2000 characters'),
    (0, express_validator_1.body)('images')
        .optional()
        .isString()
        .withMessage('Images must be a string')
        .isLength({ max: 2000 })
        .withMessage('Images must be less than 2000 characters'),
    (0, express_validator_1.body)('latitude')
        .optional()
        .isDecimal()
        .withMessage('Latitude must be a decimal number'),
    (0, express_validator_1.body)('longitude')
        .optional()
        .isDecimal()
        .withMessage('Longitude must be a decimal number'),
    (0, express_validator_1.body)('action_required')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('action_required must be Y or N'),
    (0, express_validator_1.body)('action_taken')
        .optional()
        .isString()
        .withMessage('Action taken must be a string')
        .isLength({ max: 2000 })
        .withMessage('Action taken must be less than 2000 characters'),
    (0, express_validator_1.body)('next_inspection_due')
        .optional()
        .isISO8601()
        .withMessage('Next inspection due must be a valid date'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=coolerInspections.validation.js.map