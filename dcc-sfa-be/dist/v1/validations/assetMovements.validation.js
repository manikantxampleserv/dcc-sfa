"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssetMovementsValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createAssetMovementsValidation = [
    (0, express_validator_1.body)('asset_id').isInt().withMessage('Asset ID is required'),
    (0, express_validator_1.body)('performed_by').isInt().withMessage('Performed By is required'),
    (0, express_validator_1.body)('from_location').isString().withMessage('From Location is required'),
    (0, express_validator_1.body)('to_location').isString().withMessage('To Location is required'),
    (0, express_validator_1.body)('movement_type').isString().withMessage('Movement Type is required'),
    (0, express_validator_1.body)('movement_date').isDate().withMessage('Movement Date is required'),
    (0, express_validator_1.body)('notes').isString().withMessage('Notes is required'),
    (0, express_validator_1.body)('is_active').isString().withMessage('Is Active is required'),
];
//# sourceMappingURL=assetMovements.validation.js.map