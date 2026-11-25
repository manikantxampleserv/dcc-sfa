import { Request, Response } from 'express';
export declare const assetMaintenanceController: {
    /**
     * Creates a new maintenance ticket and logs the event to asset_activities.
     */
    createAssetMaintenance(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Retrieves paginated maintenance tickets with dashboard summary counts.
     */
    getAllAssetMaintenance(req: any, res: any): Promise<void>;
    /**
     * Retrieves single maintenance ticket by ID with replace review check.
     */
    getAssetMaintenanceById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Updates an existing maintenance record.
     */
    updateAssetMaintenance(req: any, res: any): Promise<any>;
    /**
     * Assigns technician, sets priority, and auto-calculates SLA due date.
     */
    assignTechnician(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Submits mobile repair result from Flutter app (Baraka).
     */
    submitMobileRepairResult(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Finalizes and closes a maintenance ticket with verified parts and labour.
     */
    closeMaintenanceJob(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Executes the workshop return movement (and optional standby cooler install)
     * directly from a maintenance job, moving the job to `at_workshop`.
     */
    createWorkshopReturnMovement(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Installs a standby cooler at the origin outlet for an already-returned
     * workshop maintenance ticket.
     */
    installStandbyCooler(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Retrieves quick summary stats for top KPI cards, optionally filtered by technician.
     */
    getMaintenanceDashboardStats(req: Request, res: Response): Promise<void>;
    /**
     * Soft deletes a maintenance record.
     */
    deleteAssetMaintenance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=assetMaintenance.controller.d.ts.map