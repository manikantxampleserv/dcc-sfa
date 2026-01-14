import type { RequestHandler, Response } from 'express';

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
      success<T = unknown>(
        message: string,
        data?: T,
        statusCode?: number,
        pagination?: PaginationInput,
        stats?: unknown
      ): Response;

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
export const responseHandler: RequestHandler = (_req, res, next) => {
  const startTime = Date.now();

  const baseMeta = (): ApiResponseMeta => ({
    requestDuration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  });

  const successMeta = (pagination?: PaginationInput): ApiResponseMeta => {
    if (!pagination) return baseMeta();

    return {
      ...baseMeta(),
      total: pagination.total_count,
      page: pagination.current_page,
      limit: pagination.per_page ?? 10,
      totalPages: pagination.total_pages,
    };
  };

  res.success = <T = unknown>(
    message: string,
    data?: T,
    statusCode: number = 200,
    pagination?: PaginationInput,
    stats?: unknown
  ): Response => {
    const response: ApiResponse<T> = {
      success: true,
      message,
      meta: successMeta(pagination),
      stats,
    };

    if (data !== null && data !== undefined) response.data = data;

    return res.status(statusCode).json(response);
  };

  res.error = (error: string, statusCode: number = 500): Response => {
    const response: ApiResponse = {
      success: false,
      message: 'Request failed',
      error,
      meta: baseMeta(),
    };

    return res.status(statusCode).json(response);
  };

  res.validationError = (
    errors: ValidationIssue[],
    statusCode: number = 400
  ): Response => {
    const formattedErrors: Record<string, string[]> = {};

    for (const error of errors) {
      const field = error.param ?? error.path ?? error.field ?? 'unknown';
      const message = error.msg ?? error.message ?? 'Validation failed';

      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(message);
    }

    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
      meta: baseMeta(),
    };

    return res.status(statusCode).json(response);
  };

  next();
};
