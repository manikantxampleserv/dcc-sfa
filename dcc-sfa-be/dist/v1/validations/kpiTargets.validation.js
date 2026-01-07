"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKpiTargetValidation = exports.createKpiTargetValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createKpiTargetValidation = [
    (0, express_validator_1.body)('employee_id')
        .notEmpty()
        .withMessage('Employee ID is required')
        .isInt({ min: 1 })
        .withMessage('Employee ID must be a positive integer'),
    (0, express_validator_1.body)('kpi_name')
        .notEmpty()
        .withMessage('KPI name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('KPI name must be between 2 and 100 characters')
        .trim(),
    (0, express_validator_1.body)('target_value')
        .notEmpty()
        .withMessage('Target value is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Target value must be a valid decimal number')
        .custom(value => {
        if (parseFloat(value) < 0) {
            throw new Error('Target value must be non-negative');
        }
        return true;
    }),
    (0, express_validator_1.body)('measure_unit')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Measure unit must not exceed 50 characters')
        .trim(),
    (0, express_validator_1.body)('period_start')
        .notEmpty()
        .withMessage('Period start date is required')
        .isISO8601()
        .withMessage('Period start must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('period_end')
        .notEmpty()
        .withMessage('Period end date is required')
        .isISO8601()
        .withMessage('Period end must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
        if (req.body.period_start &&
            new Date(value) <= new Date(req.body.period_start)) {
            throw new Error('Period end date must be after period start date');
        }
        return true;
    }),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Status must be Y or N'),
];
exports.updateKpiTargetValidation = [
    (0, express_validator_1.body)('employee_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Employee ID must be a positive integer'),
    (0, express_validator_1.body)('kpi_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('KPI name must be between 2 and 100 characters')
        .trim(),
    (0, express_validator_1.body)('target_value')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Target value must be a valid decimal number')
        .custom(value => {
        if (value !== undefined && parseFloat(value) < 0) {
            throw new Error('Target value must be non-negative');
        }
        return true;
    }),
    (0, express_validator_1.body)('measure_unit')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Measure unit must not exceed 50 characters')
        .trim(),
    (0, express_validator_1.body)('period_start')
        .optional()
        .isISO8601()
        .withMessage('Period start must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('period_end')
        .optional()
        .isISO8601()
        .withMessage('Period end must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
        if (value &&
            req.body.period_start &&
            new Date(value) <= new Date(req.body.period_start)) {
            throw new Error('Period end date must be after period start date');
        }
        return true;
    }),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Status must be Y or N'),
];
//# sourceMappingURL=kpiTargets.validation.js.map