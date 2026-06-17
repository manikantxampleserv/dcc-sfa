"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepotValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createDepotValidation = [
    (0, express_validator_1.body)('parent_id')
        .isInt()
        .withMessage('Parent ID is required and must be a number'),
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string'),
    (0, express_validator_1.body)('address').optional().isString().withMessage('Address must be a string'),
    (0, express_validator_1.body)('city').optional().isString().withMessage('City must be a string'),
    (0, express_validator_1.body)('state').optional().isString().withMessage('State must be a string'),
    (0, express_validator_1.body)('zipcode').optional().isString().withMessage('Zipcode must be a string'),
    (0, express_validator_1.body)('phone_number')
        .optional()
        .isString()
        .withMessage('Phone number must be a string'),
    (0, express_validator_1.body)('email')
        .optional()
        .custom(value => {
        if (!value || value.trim() === '')
            return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    })
        .withMessage('Enter a valid email'),
    (0, express_validator_1.body)('manager_id')
        .optional()
        .isInt()
        .withMessage('Manager ID must be a number'),
    (0, express_validator_1.body)('supervisor_id')
        .optional()
        .isInt()
        .withMessage('Supervisor ID must be a number'),
    (0, express_validator_1.body)('coordinator_id')
        .optional()
        .isInt()
        .withMessage('Coordinator ID must be a number'),
    (0, express_validator_1.body)('latitude')
        .optional()
        .isDecimal()
        .withMessage('Latitude must be a decimal'),
    (0, express_validator_1.body)('longitude')
        .optional()
        .isDecimal()
        .withMessage('Longitude must be a decimal'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=depots.validation.js.map