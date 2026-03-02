"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssetMasterValidation = exports.createAssetMasterValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createAssetMasterValidation = [
    (0, express_validator_1.body)('asset_type_id')
        .notEmpty()
        .withMessage('Asset type ID is required')
        .isInt({ min: 1 })
        .withMessage('Asset type ID must be a positive integer'),
    (0, express_validator_1.body)('serial_number')
        .notEmpty()
        .withMessage('Serial number is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Serial number must be between 1 and 100 characters')
        .matches(/^[A-Za-z0-9\-_]+$/)
        .withMessage('Serial number can only contain letters, numbers, hyphens, and underscores'),
    (0, express_validator_1.body)('purchase_date')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Purchase date must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('warranty_expiry')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Warranty expiry must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('current_location')
        .optional({ checkFalsy: true })
        .isLength({ max: 255 })
        .withMessage('Current location must not exceed 255 characters'),
    (0, express_validator_1.body)('current_status')
        .optional({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage('Current status must not exceed 50 characters')
        .isIn([
        'Available',
        'In Use',
        'Under Maintenance',
        'Retired',
        'Lost',
        'Damaged',
    ])
        .withMessage('Current status must be one of: Available, In Use, Under Maintenance, Retired, Lost, Damaged'),
    (0, express_validator_1.body)('assigned_to')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 })
        .withMessage('Assigned to must not exceed 100 characters'),
    (0, express_validator_1.body)('is_active')
        .optional({ checkFalsy: true })
        .isIn(['Y', 'N'])
        .withMessage('Status must be Y or N'),
];
exports.updateAssetMasterValidation = [
    (0, express_validator_1.body)('asset_type_id')
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('Asset type ID must be a positive integer'),
    (0, express_validator_1.body)('serial_number')
        .optional({ checkFalsy: true })
        .isLength({ min: 1, max: 100 })
        .withMessage('Serial number must be between 1 and 100 characters')
        .matches(/^[A-Za-z0-9\-_]+$/)
        .withMessage('Serial number can only contain letters, numbers, hyphens, and underscores'),
    (0, express_validator_1.body)('purchase_date')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Purchase date must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('warranty_expiry')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Warranty expiry must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('current_location')
        .optional({ checkFalsy: true })
        .isLength({ max: 255 })
        .withMessage('Current location must not exceed 255 characters'),
    (0, express_validator_1.body)('current_status')
        .optional({ checkFalsy: true })
        .isLength({ max: 50 })
        .withMessage('Current status must not exceed 50 characters')
        .isIn([
        'Available',
        'In Use',
        'Under Maintenance',
        'Retired',
        'Lost',
        'Damaged',
    ])
        .withMessage('Current status must be one of: Available, In Use, Under Maintenance, Retired, Lost, Damaged'),
    (0, express_validator_1.body)('assigned_to')
        .optional({ checkFalsy: true })
        .isLength({ max: 100 })
        .withMessage('Assigned to must not exceed 100 characters'),
    (0, express_validator_1.body)('is_active')
        .optional({ checkFalsy: true })
        .isIn(['Y', 'N'])
        .withMessage('Status must be Y or N'),
];
//# sourceMappingURL=assetMaster.validation.js.map