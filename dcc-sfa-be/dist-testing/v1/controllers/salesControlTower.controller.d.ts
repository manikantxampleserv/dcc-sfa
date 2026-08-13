import { Request, Response } from 'express';
/**
 * Controller for Sales Control Tower dashboard.
 */
export declare const salesControlTowerController: {
    /**
     * Fetches dashboard data including aggregated metrics, maps, and filters.
     * Accepts query parameters for date ranges, dimensions, and comparison mode.
     * @param req - Express Request object containing query filters
     * @param res - Express Response object for sending JSON payload
     */
    getDashboardData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Exports a flat Excel file of all sales invoice line items
     * matching the same filters as getDashboardData.
     * One row per invoice_item → fully expanded, no aggregation.
     */
    exportSalesData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=salesControlTower.controller.d.ts.map