"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
/**
 * Attaches `res.success`, `res.error`, and `res.validationError` helpers.
 */
const responseHandler = (_req, res, next) => {
    const startTime = Date.now();
    const baseMeta = () => ({
        requestDuration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
    });
    const successMeta = (pagination) => {
        if (!pagination)
            return baseMeta();
        return {
            ...baseMeta(),
            total: pagination.total_count,
            page: pagination.current_page,
            limit: pagination.per_page ?? 10,
            totalPages: pagination.total_pages,
        };
    };
    res.success = (message, data, statusCode = 200, pagination, stats) => {
        const response = {
            success: true,
            message,
            meta: successMeta(pagination),
            stats,
        };
        if (data !== null && data !== undefined)
            response.data = data;
        return res.status(statusCode).json(response);
    };
    res.error = (error, statusCode = 500) => {
        const response = {
            success: false,
            message: 'Request failed',
            error,
            meta: baseMeta(),
        };
        return res.status(statusCode).json(response);
    };
    res.validationError = (errors, statusCode = 400) => {
        const formattedErrors = {};
        for (const error of errors) {
            const field = error.param ?? error.path ?? error.field ?? 'unknown';
            const message = error.msg ?? error.message ?? 'Validation failed';
            if (!formattedErrors[field]) {
                formattedErrors[field] = [];
            }
            formattedErrors[field].push(message);
        }
        const response = {
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
            meta: baseMeta(),
        };
        return res.status(statusCode).json(response);
    };
    next();
};
exports.responseHandler = responseHandler;
//# sourceMappingURL=response.middleware.js.map