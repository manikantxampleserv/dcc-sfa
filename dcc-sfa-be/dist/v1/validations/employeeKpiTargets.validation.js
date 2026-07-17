"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployeeKpiTargetValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createEmployeeKpiTargetValidation = [
    (0, express_validator_1.body)('employee_id').isInt().withMessage('Employee ID is required'),
    (0, express_validator_1.body)('kpi_name').isString().withMessage('KPI name is required'),
    (0, express_validator_1.body)('target_value').isFloat().withMessage('Target value is required'),
    (0, express_validator_1.body)('measure_unit').isString().optional(),
    (0, express_validator_1.body)('period_start').isDate().withMessage('Period start is required'),
    (0, express_validator_1.body)('period_end').isDate().withMessage('Period end is required'),
    (0, express_validator_1.body)('is_active').isString().optional(),
];
//# sourceMappingURL=employeeKpiTargets.validation.js.map