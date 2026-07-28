"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverySchedulesValidation = void 0;
const express_validator_1 = require("express-validator");
exports.deliverySchedulesValidation = [
    (0, express_validator_1.body)('order_id').isInt().withMessage('Order ID is required'),
    (0, express_validator_1.body)('customer_id').isInt().withMessage('Customer ID is required'),
    (0, express_validator_1.body)('scheduled_date').isDate().withMessage('Scheduled date is required'),
    (0, express_validator_1.body)('scheduled_time_slot')
        .optional()
        .isString()
        .withMessage('Scheduled time slot must be a string'),
    (0, express_validator_1.body)('assigned_vehicle_id')
        .optional()
        .isInt()
        .withMessage('Assigned vehicle ID must be an integer'),
    (0, express_validator_1.body)('assigned_driver_id')
        .optional()
        .isInt()
        .withMessage('Assigned driver ID must be an integer'),
    (0, express_validator_1.body)('status').optional().isString().withMessage('Status must be a string'),
    (0, express_validator_1.body)('priority')
        .optional()
        .isString()
        .withMessage('Priority must be a string'),
    (0, express_validator_1.body)('delivery_instructions')
        .optional()
        .isString()
        .withMessage('Delivery instructions must be a string'),
    (0, express_validator_1.body)('actual_delivery_time')
        .optional()
        .isDate()
        .withMessage('Actual delivery time must be a date'),
    (0, express_validator_1.body)('delivery_proof')
        .optional()
        .isString()
        .withMessage('Delivery proof must be a string'),
    (0, express_validator_1.body)('customer_signature')
        .optional()
        .isString()
        .withMessage('Customer signature must be a string'),
    (0, express_validator_1.body)('failure_reason')
        .optional()
        .isString()
        .withMessage('Failure reason must be a string'),
    (0, express_validator_1.body)('rescheduled_date')
        .optional()
        .isDate()
        .withMessage('Rescheduled date must be a date'),
    (0, express_validator_1.body)('is_active')
        .optional()
        .isString()
        .withMessage('Is active must be a string'),
];
//# sourceMappingURL=deliverySchedules.validation.js.map