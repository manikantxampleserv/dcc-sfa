import { Request, Response } from 'express';
/**
 * Executive Dashboard Controller
 * Provides aggregated statistics and analytics for the executive dashboard
 */
export declare const executiveDashboardController: {
    /**
     * Get Dashboard Statistics
     * GET /api/v1/dashboard/statistics
     * Returns overall system statistics
     */
    getStatistics(req: Request, res: Response): Promise<void>;
    /**
     * Get Sales Performance Data
     * GET /api/v1/dashboard/sales-performance
     * Returns sales data for charts (last 7 days, last 30 days)
     */
    getSalesPerformance(req: Request, res: Response): Promise<void>;
    /**
     * Get Top Products Data
     * GET /api/v1/dashboard/top-products
     * Returns top selling products
     */
    getTopProducts(req: Request, res: Response): Promise<void>;
    /**
     * Get Order Status Distribution
     * GET /api/v1/dashboard/order-status
     * Returns order counts by status
     */
    getOrderStatus(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=executiveDashboard.controller.d.ts.map