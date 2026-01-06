"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserValidation = exports.createUserValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createUserValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Enter a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('role_id')
        .isInt()
        .withMessage('Role ID is required and must be a number'),
    (0, express_validator_1.body)('parent_id')
        .optional()
        .isInt()
        .withMessage('Parent ID must be a number'),
    (0, express_validator_1.body)('depot_id').optional().isInt().withMessage('Depot ID must be a number'),
    (0, express_validator_1.body)('zone_id').optional().isInt().withMessage('Zone ID must be a number'),
    (0, express_validator_1.body)('employee_id').optional().isString(),
    (0, express_validator_1.body)('joining_date')
        .optional()
        .isISO8601()
        .withMessage('Joining date must be a valid date'),
    (0, express_validator_1.body)('phone_number')
        .optional()
        .isString()
        .withMessage('Phone number must be a string'),
    (0, express_validator_1.body)('address').optional().isString(),
    (0, express_validator_1.body)('reporting_to').optional().isInt(),
    (0, express_validator_1.body)('profile_image')
        .optional()
        .isURL()
        .withMessage('Profile image must be a URL'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
exports.updateUserValidation = [
    (0, express_validator_1.body)('username')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Enter a valid email'),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'user', 'manager'])
        .withMessage('Role must be admin, user or manager'),
];
//# sourceMappingURL=user.validation.js.map