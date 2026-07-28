"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssetWarrantyClaimsValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createAssetWarrantyClaimsValidation = [
    (0, express_validator_1.body)('asset_id').isInt().withMessage('asset_id must be an integer'),
    (0, express_validator_1.body)('claim_date').isDate().withMessage('claim_date must be a date'),
    (0, express_validator_1.body)('issue_description')
        .optional()
        .isString()
        .withMessage('issue_description must be a string'),
    (0, express_validator_1.body)('claim_status')
        .optional()
        .isString()
        .withMessage('claim_status must be a string'),
    (0, express_validator_1.body)('resolved_date')
        .optional()
        .isDate()
        .withMessage('resolved_date must be a date'),
    (0, express_validator_1.body)('notes').optional().isString().withMessage('notes must be a string'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isString()
        .withMessage('is_active must be a string'),
];
//# sourceMappingURL=assetWarrantyClaims.validation.js.map