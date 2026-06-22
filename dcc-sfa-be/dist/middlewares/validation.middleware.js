"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => {
            const field = 'param' in err ? err.param : 'path' in err ? err.path : 'unknown';
            return {
                field,
                message: err.msg,
            };
        });
        return res.status(422).json({
            success: false,
            message: 'Please fill all required fields',
            errors: extractedErrors,
        });
    }
    next();
};
exports.validate = validate;
//# sourceMappingURL=validation.middleware.js.map