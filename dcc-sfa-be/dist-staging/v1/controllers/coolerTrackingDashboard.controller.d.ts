import { Request, Response } from 'express';
export declare const coolerTrackingDashboardController: {
    /**
     * @route GET /api/v1/reports/cooler-tracking-dashboard
     * @description Aggregated payload for the Cooler Tracking Dashboard.
     *
     * Design: ALL queries avoid IN/NOT IN with large arrays to stay under SQL
     * Server's 2100-parameter cap. Joins are done in memory using Maps.
     */
    getDashboardData(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=coolerTrackingDashboard.controller.d.ts.map