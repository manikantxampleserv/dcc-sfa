"use strict";
/**
 * @fileoverview Asset Maintenance Validations
 * @description Validation rules for asset maintenance endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssetMaintenanceValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createAssetMaintenanceValidation = [
    (0, express_validator_1.body)('asset_id').isInt().withMessage('Asset ID must be an integer'),
    (0, express_validator_1.body)('technician_id')
        .optional({ nullable: true, checkFalsy: true })
        .isInt()
        .withMessage('Technician ID must be an integer'),
    (0, express_validator_1.body)('maintenance_date')
        .isDate()
        .withMessage('Maintenance date must be a valid date'),
    (0, express_validator_1.body)('issue_reported')
        .optional({ nullable: true })
        .isString()
        .withMessage('Issue reported must be a string'),
    (0, express_validator_1.body)('action_taken')
        .optional({ nullable: true })
        .isString()
        .withMessage('Action taken must be a string'),
    (0, express_validator_1.body)('cost')
        .optional({ nullable: true, checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage('Cost must be a non-negative number'),
    (0, express_validator_1.body)('remarks')
        .optional({ nullable: true })
        .isString()
        .withMessage('Remarks must be a string'),
    (0, express_validator_1.body)('status')
        .optional({ nullable: true })
        .isString()
        .withMessage('Status must be a string'),
    (0, express_validator_1.body)('repair_location')
        .optional({ nullable: true })
        .isString()
        .withMessage('Repair location must be a string'),
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