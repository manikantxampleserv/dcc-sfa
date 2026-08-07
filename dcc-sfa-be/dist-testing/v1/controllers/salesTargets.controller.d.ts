import { Request, Response } from 'express';
export declare const salesTargetsController: {
    /**
     * Creates a new sales target.
     * Validates group, category, and date overlaps.
     */
    createSalesTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Retrieves all sales targets with pagination and filtering.
     * Includes statistics for dashboard views.
     */
    getAllSalesTargets(req: any, res: any): Promise<void>;
    /**
     * Retrieves a specific sales target by its ID.
     */
    getSalesTargetById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Updates an existing sales target.
     * Validates overlaps and references before updating.
     */
    updateSalesTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Soft-deletes a sales target by setting is_active to 'N'.
     */
    deleteSalesTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Retrieves personalized targets for the logged-in salesman.
     * Merges group targets with individual overrides and calculates actual achievements.
     */
    getSalesmanTargets(req: any, res: any): Promise<any>;
};
//# sourceMappingURL=salesTargets.controller.d.ts.map