import { Request, Response } from 'express';
/**
 * Reports Controller
 * Handles various reporting endpoints
 */
export declare const reportsController: {
    /**
     * Get Orders, Invoices, and Returns Report
     * GET /api/v1/reports/orders-invoices-returns
     */
    getOrdersInvoicesReturnsReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Orders, Invoices, and Returns Report to Excel
     * GET /api/v1/reports/orders-invoices-returns/export
     */
    exportOrdersInvoicesReturnsReport(req: Request, res: Response): Promise<void>;
    /**
     * Get Sales vs Target Report
     * GET /api/v1/reports/sales-vs-target
     */
    getSalesVsTargetReport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Export Sales vs Target Report to Excel
     * GET /api/v1/reports/sales-vs-target/export
     */
    exportSalesVsTargetReport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get Asset Movement/Status Report
     * GET /api/v1/reports/asset-movement-status
     */
    getAssetMovementStatusReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Asset $"Movement/Status Report to Excel
     * GET /api/v1/reports/asset-movement-status/export
     */
    exportAssetMovementStatusReport(req: Request, res: Response): Promise<void>;
    /**
     * Get Visit Frequency/Completion Report
     * GET /api/v1/reports/visit-frequency-completion
     */
    getVisitFrequencyCompletionReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Visit Frequency/Completion Report to Excel
     * GET /api/v1/reports/visit-frequency-completion/export
     */
    exportVisitFrequencyCompletionReport(req: Request, res: Response): Promise<void>;
    /**
     * Get Promo Effectiveness Report
     * GET /api/v1/reports/promo-effectiveness
     */
    getPromoEffectivenessReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Promo Effectiveness Report to Excel
     * GET /api/v1/reports/promo-effectiveness/export
     */
    exportPromoEffectivenessReport(req: Request, res: Response): Promise<void>;
    /**
     * Get Region/Territory Sales Report
     * GET /api/v1/reports/region-territory-sales
     */
    getRegionTerritorySalesReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Region/Territory Sales Report to Excel
     * GET /api/v1/reports/region-territory-sales/export
     */
    exportRegionTerritorySalesReport(req: Request, res: Response): Promise<void>;
    /**
     * Get Rep Productivity Report
     * GET /api/v1/reports/rep-productivity
     */
    getRepProductivityReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Rep Productivity Report to Excel
     * GET /api/v1/reports/rep-productivity/export
     */
    exportRepProductivityReport(req: Request, res: Response): Promise<void>;
    /**
     * Get Competitor Analysis Report
     * GET /api/v1/reports/competitor-analysis
     */
    getCompetitorAnalysisReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Competitor Analysis Report to Excel
     * GET /api/v1/reports/competitor-analysis/export
     */
    exportCompetitorAnalysisReport(req: Request, res: Response): Promise<void>;
    /**
     * Get Outstanding & Collection Report
     * GET /api/v1/reports/outstanding-collection
     */
    getOutstandingCollectionReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Outstanding & Collection Report to Excel
     * GET /api/v1/reports/outstanding-collection/export
     */
    exportOutstandingCollectionReport(req: Request, res: Response): Promise<void>;
    /**
     * Get Attendance History Report
     * GET /api/v1/reports/attendance-history
     */
    getAttendanceHistoryReport(req: Request, res: Response): Promise<void>;
    /**
     * Export Attendance History Report to Excel
     * GET /api/v1/reports/attendance-history/export
     */
    exportAttendanceHistoryReport(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=reports.controller.d.ts.map