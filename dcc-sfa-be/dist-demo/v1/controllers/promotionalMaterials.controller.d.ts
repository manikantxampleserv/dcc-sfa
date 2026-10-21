import { Response } from 'express';
/**
 * Controller for managing Promotional Materials Master catalog and Outlet Promotional Materials.
 */
export declare const promotionalMaterialsController: {
    /**
     * Retrieves a paginated list of promotional materials with search and status filtering.
     *
     * @param req - Express request with query parameters (page, limit, search, status)
     * @param res - Express response
     */
    getPromotionalMaterials(req: any, res: Response): Promise<void>;
    /**
     * Retrieves a single promotional material by ID.
     *
     * @param req - Express request with param id
     * @param res - Express response
     */
    getPromotionalMaterialById(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Creates a new promotional material in the master catalog.
     *
     * @param req - Express request with payload (code, name, uom, default_unit_value, description)
     * @param res - Express response
     */
    createPromotionalMaterial(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Updates an existing promotional material record.
     *
     * @param req - Express request with param id and update payload
     * @param res - Express response
     */
    updatePromotionalMaterial(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Deactivates (soft deletes) a promotional material.
     *
     * @param req - Express request with param id
     * @param res - Express response
     */
    deletePromotionalMaterial(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Returns promotional materials analytics, aggregated issued items, and history for a specific outlet.
     * Used on the Outlet Detail page Promotional Materials tab.
     *
     * @param req - Express request with outletId param
     * @param res - Express response
     */
    getOutletPromotionalMaterials(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=promotionalMaterials.controller.d.ts.map