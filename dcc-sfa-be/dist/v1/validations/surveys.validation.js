"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSurveyValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createSurveyValidation = [
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Survey title is required')
        .isString()
        .withMessage('Survey title must be a string')
        .isLength({ min: 2, max: 255 })
        .withMessage('Survey title must be between 2 and 255 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    (0, express_validator_1.body)('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn([
        'cooler_inspection',
        'customer_feedback',
        'outlet_audit',
        'competitor_analysis',
        'brand_visibility',
        'general',
    ])
        .withMessage('Category must be a valid survey category'),
    (0, express_validator_1.body)('target_roles')
        .optional()
        .isString()
        .withMessage('Target roles must be a string'),
    (0, express_validator_1.body)('is_published')
        .optional()
        .isBoolean()
        .withMessage('is_published must be a boolean'),
    (0, express_validator_1.body)('published_at')
        .optional()
        .isISO8601()
        .withMessage('published_at must be a valid date'),
    (0, express_validator_1.body)('expires_at')
        .optional()
        .isISO8601()
        .withMessage('expires_at must be a valid date'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be either "Y" or "N"'),
    (0, express_validator_1.body)('fields').optional().isArray().withMessage('Fields must be an array'),
    (0, express_validator_1.body)('fields.*.label')
        .if((0, express_validator_1.body)('fields').exists())
        .notEmpty()
        .withMessage('Field label is required'),
    (0, express_validator_1.body)('fields.*.field_type')
        .if((0, express_validator_1.body)('fields').exists())
        .isIn([
        'text',
        'textarea',
        'number',
        'select',
        'checkbox',
        'radio',
        'date',
        'time',
        'photo',
        'signature',
    ])
        .withMessage('Invalid field type'),
    (0, express_validator_1.body)('fields.*.options')
        .optional()
        .isString()
        .withMessage('Field options must be a string'),
    (0, express_validator_1.body)('fields.*.is_required')
        .optional()
        .isBoolean()
        .withMessage('is_required must be a boolean'),
    (0, express_validator_1.body)('fields.*.sort_order')
        .optional()
        .isInt()
        .withMessage('sort_order must be an integer'),
];
//# sourceMappingURL=surveys.validation.js.map