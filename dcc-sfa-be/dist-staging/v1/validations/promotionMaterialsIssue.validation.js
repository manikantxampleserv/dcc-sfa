"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionMaterialsIssueValidation = exports.createPromotionMaterialsIssueValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createPromotionMaterialsIssueValidation = [
    (0, express_validator_1.body)('depot_id')
        .notEmpty()
        .withMessage('Depot is required')
        .isInt()
        .withMessage('Depot must be a valid integer'),
    (0, express_validator_1.body)('outlet_id')
        .notEmpty()
        .withMessage('Outlet is required')
        .isInt()
        .withMessage('Outlet must be a valid integer'),
    (0, express_validator_1.body)('issue_date')
        .notEmpty()
        .withMessage('Issue Date is required')
        .isISO8601()
        .withMessage('Issue Date must be a valid date'),
    (0, express_validator_1.body)('issued_by_id')
        .notEmpty()
        .withMessage('Issued By is required')
        .isInt()
        .withMessage('Issued By must be a valid integer'),
    (0, express_validator_1.body)('campaign_reference')
        .optional()
        .isString()
        .withMessage('Campaign reference must be a string'),
    (0, express_validator_1.body)('notes')
        .optional()
        .isString()
        .withMessage('Notes must be a string'),
    (0, express_validator_1.body)('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    (0, express_validator_1.body)('items.*.asset_id')
        .notEmpty()
        .withMessage('Item Asset is required')
        .isInt()
        .withMessage('Item Asset must be a valid integer'),
    (0, express_validator_1.body)('items.*.quantity')
        .notEmpty()
        .withMessage('Item quantity is required')
        .isFloat({ min: 0.01 })
        .withMessage('Item quantity must be greater than 0'),
    (0, express_validator_1.body)('items.*.unit_value')
        .optional()
        .isNumeric()
        .withMessage('Unit value must be a valid number'),
    (0, express_validator_1.body)('items.*.total_value')
        .optional()
        .isNumeric()
        .withMessage('Total value must be a valid number'),
];
exports.updatePromotionMaterialsIssueValidation = [
    (0, express_validator_1.body)('depot_id')
        .optional()
        .isInt()
        .withMessage('Depot must be a valid integer'),
    (0, express_validator_1.body)('outlet_id')
        .optional()
        .isInt()
        .withMessage('Outlet must be a valid integer'),
    (0, express_validator_1.body)('issue_date')
        .optional()
        .isISO8601()
        .withMessage('Issue Date must be a valid date'),
    (0, express_validator_1.body)('issued_by_id')
        .optional()
        .isInt()
        .withMessage('Issued By must be a valid integer'),
    (0, express_validator_1.body)('items')
        .optional()
        .isArray()
        .withMessage('Items must be an array'),
    (0, express_validator_1.body)('items.*.asset_id')
        .optional()
        .isInt()
        .withMessage('Item Asset must be a valid integer'),
    (0, express_validator_1.body)('items.*.quantity')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Item quantity must be greater than 0'),
];
//# sourceMappingURL=promotionMaterialsIssue.validation.js.map