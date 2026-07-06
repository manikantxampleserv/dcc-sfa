import { Request, Response } from 'express';
export declare const reconciliationController: {
    /**
     * List all reconciliations — one row per salesman load.
     * Returns reconciliation header data only (no item details).
     */
    getAllReconciliations: (req: Request, res: Response) => Promise<void>;
    /**
     * Get loaded products (items) for a specific reconciliation by ID.
     */
    getReconciliationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Save and reconcile updated actual quantity values
     */
    saveReconciliations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Export reconciliation sheet to styled Excel
     */
    exportReconciliationExcel: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=reconciliation.controller.d.ts.map