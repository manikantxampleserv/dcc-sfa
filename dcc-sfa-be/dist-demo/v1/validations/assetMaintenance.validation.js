"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssetMaintenanceValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createAssetMaintenanceValidation = [
    (0, express_validator_1.body)('asset_id').isInt().withMessage('Asset ID must be an integer'),
    (0, express_validator_1.body)('technician_id').isInt().withMessage('Technician ID must be an integer'),
    (0, express_validator_1.body)('maintenance_date')
        .isDate()
        .withMessage('Maintenance date must be a valid date'),
    (0, express_validator_1.body)('issue_reported')
        .optional()
        .isString()
        .withMessage('Issue reported must be a string'),
    (0, express_validator_1.body)('action_taken')
        .optional()
        .isString()
        .withMessage('Action taken must be a string'),
    (0, express_validator_1.body)('cost')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Cost must be a non-negative number'),
    (0, express_validator_1.body)('remarks').optional().isString().withMessage('Remarks must be a string'),
    (0, express_validator_1.body)('spares').optional().isArray().withMessage('Spares must be an array'),
    (0, express_validator_1.body)('spares.*.name')
        .optional()
        .isString()
        .withMessage('Spare part name must be a string'),
    (0, express_validator_1.body)('spares.*.cost')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Spare part cost must be a non-negative number'),
];
//# sourceMappingURL=assetMaintenance.validation.js.map