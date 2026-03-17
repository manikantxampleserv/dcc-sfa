"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerComplaintsValidation = void 0;
const express_validator_1 = require("express-validator");
const validateComplaintFields = () => [
    (0, express_validator_1.body)('customer_id').isInt().withMessage('Customer ID is required'),
    (0, express_validator_1.body)('complaint_title')
        .notEmpty()
        .withMessage('Complaint title is required')
        .isLength({ max: 255 })
        .withMessage('Complaint title must be less than 255 characters'),
    (0, express_validator_1.body)('complaint_description')
        .notEmpty()
        .withMessage('Complaint description is required'),
    (0, express_validator_1.body)('submitted_by').isInt().withMessage('Submitted by is required'),
];
exports.createCustomerComplaintsValidation = [
    (0, express_validator_1.body)().custom((value, { req }) => {
        if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
            throw new Error('Request body cannot be empty');
        }
        return true;
    }),
    // Validate array items
    (0, express_validator_1.body)('*')
        .if((0, express_validator_1.body)().isArray())
        .isObject()
        .withMessage('Each item must be an object'),
    (0, express_validator_1.body)('*.customer_id')
        .if((0, express_validator_1.body)().isArray())
        .isInt()
        .withMessage('Customer ID is required'),
    (0, express_validator_1.body)('*.complaint_title')
        .if((0, express_validator_1.body)().isArray())
        .notEmpty()
        .withMessage('Complaint title is required')
        .isLength({ max: 255 })
        .withMessage('Complaint title must be less than 255 characters'),
    (0, express_validator_1.body)('*.complaint_description')
        .if((0, express_validator_1.body)().isArray())
        .notEmpty()
        .withMessage('Complaint description is required'),
    (0, express_validator_1.body)('*.status')
        .if((0, express_validator_1.body)().isArray())
        .isIn(['P', 'R', 'C'])
        .withMessage('Status must be P, R, or C'),
    (0, express_validator_1.body)('*.submitted_by')
        .if((0, express_validator_1.body)().isArray())
        .isInt()
        .withMessage('Submitted by is required'),
    (0, express_validator_1.body)('customer_id')
        .if((0, express_validator_1.body)().isObject())
        .isInt()
        .withMessage('Customer ID is required'),
    (0, express_validator_1.body)('complaint_title')
        .if((0, express_validator_1.body)().isObject())
        .notEmpty()
        .withMessage('Complaint title is required')
        .isLength({ max: 255 })
        .withMessage('Complaint title must be less than 255 characters'),
    (0, express_validator_1.body)('complaint_description')
        .if((0, express_validator_1.body)().isObject())
        .notEmpty()
        .withMessage('Complaint description is required'),
    (0, express_validator_1.body)('status')
        .if((0, express_validator_1.body)().isObject())
        .isIn(['P', 'R', 'C'])
        .withMessage('Status must be P, R, or C'),
    (0, express_validator_1.body)('submitted_by')
        .if((0, express_validator_1.body)().isObject())
        .isInt()
        .withMessage('Submitted by is required'),
];
//# sourceMappingURL=customerComplaints.validation.js.map