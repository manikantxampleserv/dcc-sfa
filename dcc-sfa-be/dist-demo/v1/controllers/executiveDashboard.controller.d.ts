import { Request, Response } from 'express';
/**
 * Executive Dashboard Controller
 * Provides aggregated statistics and analytics for the executive dashboard
 */
export declare const executiveDashboardController: {
    /**
     * Retrieves aggregated overview statistics, sales performance, top products, and order status in a single query pass
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>} JSON response containing aggregated dashboard data
     */
    getExecutiveDashboardOverview(req: Request, res: Response): Promise<void>;
    /**
     * Get Dashboard Statistics
     * GET /api/v1/dashboard/statistics
     * Returns overall system statistics
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    getStatistics(req: Request, res: Response): Promise<void>;
    /**
     * Get Sales Performance Data
     * GET /api/v1/dashboard/sales-performance
     * Returns sales data for charts
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    getSalesPerformance(req: Request, res: Response): Promise<void>;
    /**
     * Get Top Products Data
     * GET /api/v1/dashboard/top-products
     * Returns top selling products
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    getTopProducts(req: Request, res: Response): Promise<void>;
    /**
     * Get Order Status Distribution
     * GET /api/v1/dashboard/order-status
     * Returns invoice counts by salesman
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @returns {Promise<void>}
     */
    getOrderStatus(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=executiveDashboard.controller.d.ts.map