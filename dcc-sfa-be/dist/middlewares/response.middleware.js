"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
const responseHandler = (req, res, next) => {
    const startTime = Date.now();
    res.success = function (message, data = null, statusCode = 200, pagination, stats) {
        const response = {
            success: true,
            message,
            meta: {
                requestDuration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
            },
            stats,
        };
        if (data !== null)
            response.data = data;
        if (pagination) {
            response.meta = {
                ...response.meta,
                ...pagination,
                total: pagination.total_count,
                page: pagination.current_page,
                limit: pagination.per_page || 10,
                totalPages: pagination.total_pages,
            };
        }
        return this.status(statusCode).json(response);
    };
    res.error = function (error, statusCode = 500) {
        const response = {
            success: false,
            message: 'Request failed',
            error,
            meta: {
                requestDuration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
            },
        };
        return this.status(statusCode).json(response);
    };
    res.validationError = function (errors, statusCode = 400) {
        const formattedErrors = {};
        errors.forEach(error => {
            const field = error.param || error.path || error.field || 'unknown';
            const message = error.msg || error.message || 'Validation failed';
            if (!formattedErrors[field]) {
                formattedErrors[field] = [];
            }
            formattedErrors[field].push(message);
        });
        const response = {
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
            meta: {
                requestDuration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
            },
        };
        return this.status(statusCode).json(response);
    };
    next();
};
exports.responseHandler = responseHandler;
//# sourceMappingURL=response.middleware.js.map