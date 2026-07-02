import { Request, Response } from 'express';
/**
 * Error Logs Controller
 * Handles error log queries and triggers a reload
 */
export declare const errorLogsController: {
    /**
     * Get Error Logs
     * GET /api/v1/error-logs
     * Returns error logs with filtering and pagination
     */
    getErrorLogs(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=errorLogs.controller.d.ts.map