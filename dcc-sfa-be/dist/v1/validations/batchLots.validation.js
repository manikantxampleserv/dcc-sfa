"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBatchLotValidation = exports.createBatchLotValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createBatchLotValidation = [
    (0, express_validator_1.body)('batch_number')
        .notEmpty()
        .withMessage('Batch number is required')
        .isString()
        .withMessage('Batch number must be a string')
        .isLength({ max: 50 })
        .withMessage('Batch number cannot exceed 50 characters'),
    (0, express_validator_1.body)('lot_number')
        .optional()
        .isString()
        .withMessage('Lot number must be a string')
        .isLength({ max: 50 })
        .withMessage('Lot number cannot exceed 50 characters'),
    (0, express_validator_1.body)('manufacturing_date')
        .notEmpty()
        .withMessage('Manufacturing date is required')
        .isISO8601()
        .withMessage('Manufacturing date must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('expiry_date')
        .notEmpty()
        .withMessage('Expiry date is required')
        .isISO8601()
        .withMessage('Expiry date must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
        const manufacturingDate = new Date(req.body.manufacturing_date);
        const expiryDate = new Date(value);
        if (expiryDate <= manufacturingDate) {
            throw new Error('Expiry date must be after manufacturing date');
        }
        return true;
    }),
    (0, express_validator_1.body)('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('remaining_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Remaining quantity cannot be negative')
        .custom((value, { req }) => {
        if (value > req.body.quantity) {
            throw new Error('Remaining quantity cannot be greater than total quantity');
        }
        return true;
    }),
    (0, express_validator_1.body)('supplier_name')
        .optional()
        .isString()
        .withMessage('Supplier name must be a string')
        .isLength({ max: 255 })
        .withMessage('Supplier name cannot exceed 255 characters'),
    (0, express_validator_1.body)('purchase_price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Purchase price must be a positive number'),
    (0, express_validator_1.body)('quality_grade')
        .optional()
        .isIn(['A', 'B', 'C', 'D', 'F'])
        .withMessage('Quality grade must be one of: A, B, C, D, F'),
    (0, express_validator_1.body)('storage_location')
        .optional()
        .isString()
        .withMessage('Storage location must be a string')
        .isLength({ max: 100 })
        .withMessage('Storage location cannot exceed 100 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Is active must be Y or N'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
exports.updateBatchLotValidation = [
    (0, express_validator_1.body)('batch_number')
        .optional()
        .isString()
        .withMessage('Batch number must be a string')
        .isLength({ max: 50 })
        .withMessage('Batch number cannot exceed 50 characters'),
    (0, express_validator_1.body)('lot_number')
        .optional()
        .isString()
        .withMessage('Lot number must be a string')
        .isLength({ max: 50 })
        .withMessage('Lot number cannot exceed 50 characters'),
    (0, express_validator_1.body)('manufacturing_date')
        .optional()
        .isISO8601()
        .withMessage('Manufacturing date must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.body)('expiry_date')
        .optional()
        .isISO8601()
        .withMessage('Expiry date must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
        if (req.body.manufacturing_date) {
            const manufacturingDate = new Date(req.body.manufacturing_date);
            const expiryDate = new Date(value);
            if (expiryDate <= manufacturingDate) {
                throw new Error('Expiry date must be after manufacturing date');
            }
        }
        return true;
    }),
    (0, express_validator_1.body)('quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('remaining_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Remaining quantity cannot be negative')
        .custom((value, { req }) => {
        if (req.body.quantity && value > req.body.quantity) {
            throw new Error('Remaining quantity cannot be greater than total quantity');
        }
        return true;
    }),
    (0, express_validator_1.body)('supplier_name')
        .optional()
        .isString()
        .withMessage('Supplier name must be a string')
        .isLength({ max: 255 })
        .withMessage('Supplier name cannot exceed 255 characters'),
    (0, express_validator_1.body)('purchase_price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Purchase price must be a positive number'),
    (0, express_validator_1.body)('quality_grade')
        .optional()
        .isIn(['A', 'B', 'C', 'D', 'F'])
        .withMessage('Quality grade must be one of: A, B, C, D, F'),
    (0, express_validator_1.body)('storage_location')
        .optional()
        .isString()
        .withMessage('Storage location must be a string')
        .isLength({ max: 100 })
        .withMessage('Storage location cannot exceed 100 characters'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isIn(['Y', 'N'])
        .withMessage('Is active must be Y or N'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
//# sourceMappingURL=batchLots.validation.js.map