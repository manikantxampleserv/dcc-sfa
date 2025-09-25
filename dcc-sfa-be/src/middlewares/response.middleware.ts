import { Response, Request, NextFunction } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    requestDuration?: number;
    timestamp?: string;
  };
}

declare global {
  namespace Express {
    interface Response {
      success: (
        message: string,
        data?: any,
        statusCode?: number,
        pagination?: {
          current_page: number;
          total_pages: number;
          total_count: number;
          has_next: boolean;
          has_previous: boolean;
        }
      ) => Response;
      error: (error: string, statusCode?: number) => Response;
      validationError: (errors: any[], statusCode?: number) => Response;
    }
  }
}

export const responseHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.success = function (
    message: string,
    data: any = null,
    statusCode: number = 200,
    pagination?: any
  ): Response {
    const response: ApiResponse = {
      success: true,
      message,
      meta: {
        requestDuration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };

    if (data !== null) response.data = data;

    if (pagination) {
      response.meta = {
        ...response.meta,
        total: pagination.total_count,
        page: pagination.current_page,
        limit: pagination.per_page || 10,
        totalPages: pagination.total_pages,
      };
    }

    return this.status(statusCode).json(response);
  };

  res.error = function (error: string, statusCode: number = 500): Response {
    const response: ApiResponse = {
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
  res.validationError = function (
    errors: any[],
    statusCode: number = 400
  ): Response {
    const formattedErrors: Record<string, string[]> = {};

    errors.forEach(error => {
      const field = error.param || error.path || error.field || 'unknown';
      const message = error.msg || error.message || 'Validation failed';

      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(message);
    });

    const response: ApiResponse = {
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
