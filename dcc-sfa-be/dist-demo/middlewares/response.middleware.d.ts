import type { RequestHandler } from 'express';
/**
 * Standard API response envelope used by this service.
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
    meta?: ApiResponseMeta;
    stats?: unknown;
}
export interface ApiResponseMeta {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    requestDuration?: number;
    timestamp?: string;
}
export interface PaginationInput {
    total_count?: number;
    current_page?: number;
    per_page?: number;
    total_pages?: number;
}
export interface ValidationIssue {
    param?: string;
    path?: string;
    field?: string;
    msg?: string;
    message?: string;
}
declare global {
    namespace Express {
        interface Response {
            /**
             * Sends a successful API response envelope.
             */
            success<T = unknown>(message: string, data?: T, statusCode?: number, pagination?: PaginationInput, stats?: unknown): Response;
            /**
             * Sends a failed API response envelope.
             */
            error(error: string, statusCode?: number): Response;
            /**
             * Sends a validation error response with field-level messages.
             */
            validationError(errors: ValidationIssue[], statusCode?: number): Response;
        }
    }
}
/**
 * Attaches `res.success`, `res.error`, and `res.validationError` helpers.
 */
export declare const responseHandler: RequestHandler;
//# sourceMappingURL=response.middleware.d.ts.map