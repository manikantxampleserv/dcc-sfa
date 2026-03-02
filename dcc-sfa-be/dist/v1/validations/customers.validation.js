"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createCustomerValidation = [
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Customer name is required')
        .isString()
        .withMessage('Customer name must be a string'),
    (0, express_validator_1.body)('depot_id')
        .exists()
        .withMessage('Depot selection is required')
        .isInt()
        .withMessage('Depot ID must be a number'),
    (0, express_validator_1.body)('zone_id').optional().isInt().withMessage('Zone ID must be a number'),
    (0, express_validator_1.body)('zones_id').optional().isInt().withMessage('Zone ID must be a number'),
    (0, express_validator_1.body)('short_name')
        .optional()
        .isString()
        .withMessage('Short name must be a string'),
    (0, express_validator_1.body)('customer_type_id')
        .optional()
        .isInt()
        .withMessage('Customer type ID must be a number'),
    (0, express_validator_1.body)('customer_channel_id')
        .optional()
        .isInt()
        .withMessage('Customer channel ID must be a number'),
    (0, express_validator_1.body)('customer_category_id')
        .optional()
        .isInt()
        .withMessage('Customer category ID must be a number'),
    (0, express_validator_1.body)('type').optional().isString().withMessage('Type must be a string'),
    (0, express_validator_1.body)('internal_code_one')
        .optional()
        .isString()
        .withMessage('Internal code one must be a string'),
    (0, express_validator_1.body)('internal_code_two')
        .optional()
        .isString()
        .withMessage('Internal code two must be a string'),
    (0, express_validator_1.body)('contact_person')
        .optional()
        .isString()
        .withMessage('Contact person must be a string'),
    (0, express_validator_1.body)('phone_number')
        .optional()
        .isString()
        .withMessage('Phone number must be a string'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Email must be a valid email address'),
    (0, express_validator_1.body)('address').optional().isString().withMessage('Address must be a string'),
    (0, express_validator_1.body)('city').optional().isString().withMessage('City must be a string'),
    (0, express_validator_1.body)('state').optional().isString().withMessage('State must be a string'),
    (0, express_validator_1.body)('zipcode').optional().isString().withMessage('Zipcode must be a string'),
    (0, express_validator_1.body)('latitude')
        .optional()
        .isDecimal()
        .withMessage('Latitude must be a decimal number'),
    (0, express_validator_1.body)('longitude')
        .optional()
        .isDecimal()
        .withMessage('Longitude must be a decimal number'),
    (0, express_validator_1.body)('credit_limit')
        .optional()
        .isDecimal()
        .withMessage('Credit limit must be a decimal number'),
    (0, express_validator_1.body)('outstanding_amount')
        .optional()
        .isDecimal()
        .withMessage('Outstanding amount must be a decimal number'),
    (0, express_validator_1.body)('route_id').optional().isInt().withMessage('Route ID must be a number'),
    (0, express_validator_1.body)('salesperson_id')
        .optional()
        .isInt()
        .withMessage('Salesperson ID must be a number'),
    (0, express_validator_1.body)('nfc_tag_code')
        .optional()
        .isString()
        .withMessage('NFC tag code must be a string'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('is_active must be Y or N'),
];
//# sourceMappingURL=customers.validation.js.map