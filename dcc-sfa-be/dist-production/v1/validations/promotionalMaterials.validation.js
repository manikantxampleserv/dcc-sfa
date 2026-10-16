"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionalMaterialValidation = exports.createPromotionalMaterialValidation = void 0;
const express_validator_1 = require("express-validator");
/**
 * Validations for creating a new promotional material in the catalog.
 */
exports.createPromotionalMaterialValidation = [
    (0, express_validator_1.body)('code')
        .notEmpty()
        .withMessage('Item code is required')
        .isString()
        .withMessage('Item code must be a string')
        .trim(),
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Item name is required')
        .isString()
        .withMessage('Item name must be a string')
        .trim(),
    (0, express_validator_1.body)('uom')
        .optional({ nullable: true })
        .isString()
        .withMessage('UOM must be a string')
        .trim(),
    (0, express_validator_1.body)('default_unit_value')
        .optional({ nullable: true })
        .isNumeric()
        .withMessage('Default unit value must be a valid number'),
    (0, express_validator_1.body)('description')
        .optional({ nullable: true })
        .isString()
        .withMessage('Description must be a string')
        .trim(),
    (0, express_validator_1.body)('is_active')
        .optional({ nullable: true })
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
/**
 * Validations for updating an existing promotional material.
 */
exports.updatePromotionalMaterialValidation = [
    (0, express_validator_1.body)('code')
        .optional()
        .isString()
        .withMessage('Item code must be a string')
        .trim(),
    (0, express_validator_1.body)('name')
        .optional()
        .isString()
        .withMessage('Item name must be a string')
        .trim(),
    (0, express_validator_1.body)('uom')
        .optional({ nullable: true })
        .isString()
        .withMessage('UOM must be a string')
        .trim(),
    (0, express_validator_1.body)('default_unit_value')
        .optional({ nullable: true })
        .isNumeric()
        .withMessage('Default unit value must be a valid number'),
    (0, express_validator_1.body)('description')
        .optional({ nullable: true })
        .isString()
        .withMessage('Description must be a string')
        .trim(),
    (0, express_validator_1.body)('is_active')
        .optional({ nullable: true })
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=promotionalMaterials.validation.js.map