"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerAssetValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCustomerAssetValidation = [
    (0, express_validator_1.body)('customer_id').isInt().withMessage('Customer ID must be an integer'),
    (0, express_validator_1.body)('asset_type_id').isInt().withMessage('Asset Type ID must be an integer'),
    (0, express_validator_1.body)('brand_id')
        .optional()
        .isInt()
        .withMessage('Brand ID must be an integer'),
    (0, express_validator_1.body)('model').optional().isString().withMessage('Model must be a string'),
    (0, express_validator_1.body)('serial_number')
        .optional()
        .isString()
        .withMessage('Serial Number must be a string'),
    (0, express_validator_1.body)('capacity')
        .optional()
        .isInt()
        .withMessage('Capacity must be an integer'),
    (0, express_validator_1.body)('install_date')
        .optional()
        .isDate()
        .withMessage('Install Date must be a date'),
    (0, express_validator_1.body)('status').optional().isString().withMessage('Status must be a string'),
    (0, express_validator_1.body)('last_scanned_date')
        .optional()
        .isDate()
        .withMessage('Last Scanned Date must be a date'),
    (0, express_validator_1.body)('remarks').optional().isString().withMessage('Remarks must be a string'),
    (0, express_validator_1.body)('technician_id')
        .optional()
        .isInt()
        .withMessage('Technician ID must be an integer'),
    (0, express_validator_1.body)('warranty_expiry')
        .optional()
        .isDate()
        .withMessage('Warranty Expiry must be a date'),
    (0, express_validator_1.body)('maintenance_contract')
        .optional()
        .isString()
        .withMessage('Maintenance Contract must be a string'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isString()
        .withMessage('Is Active must be a string'),
];
//# sourceMappingURL=customerAssets.validation.js.map