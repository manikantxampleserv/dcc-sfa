"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockTransferRequestValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createStockTransferRequestValidation = [
    (0, express_validator_1.body)('source_type').notEmpty().withMessage('Source type is required'),
    (0, express_validator_1.body)('source_id').notEmpty().withMessage('Source ID is required'),
    (0, express_validator_1.body)('destination_type')
        .notEmpty()
        .withMessage('Destination type is required'),
    (0, express_validator_1.body)('destination_id')
        .notEmpty()
        .withMessage('Destination ID is required')
        .custom((value, { req }) => {
        if (value === req.body.source_id) {
            throw new Error('Source and destination cannot be the same');
        }
        return true;
    }),
    (0, express_validator_1.body)('requested_by').notEmpty().withMessage('Requested by is required'),
    (0, express_validator_1.body)('stock_transfer_lines')
        .notEmpty()
        .withMessage('Stock transfer lines is required'),
];
//# sourceMappingURL=stockTransferRequests.validation.js.map