import { Request, Response } from 'express';
export declare const approvalWorkflowSetupController: {
    /**
     * Creates one or multiple approval workflow setup records.
     * Clears existing setups matching the exact request type, zone, and depot before creating.
     *
     * @param req - Express request object containing workflow data array
     * @param res - Express response object
     */
    createApprovalWorkFlow(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Retrieves a single approval workflow setup record by its ID.
     *
     * @param req - Express request object containing record ID in params
     * @param res - Express response object
     */
    getApprovalWorkFlowById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Updates an existing approval workflow setup record.
     *
     * @param req - Express request object containing record ID in params and updated payload in body
     * @param res - Express response object
     */
    updateApprovalWorkFlow(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Deletes all approval workflow setup records matching a specific request type.
     *
     * @param req - Express request object containing requestType in params
     * @param res - Express response object
     */
    deleteApprovalWorkFlow(req: Request, res: Response): Promise<void>;
    /**
     * Deletes multiple approval workflow setup records by their unique IDs.
     *
     * @param req - Express request object containing IDs array in body
     * @param res - Express response object
     */
    deleteApprovalWorkFlows(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Retrieves all approval workflow setup records, grouped by request type.
     * Supports search queries, page pagination, and request type filters.
     *
     * @param req - Express request object containing query filters
     * @param res - Express response object
     */
    getAllApprovalWorkFlow(req: any, res: any): Promise<void>;
    /**
     * Retrieves active approval workflows matching a specific request type.
     * Matches specific zone/depot setups first, then falls back to global configurations.
     *
     * @param req - Express request object containing request_type, zone_id, and depot_id in query
     * @param res - Express response object
     */
    getAllApprovalWorkFlowByRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Retrieves unique zones configured with approval workflows for a request type.
     *
     * @param req - Express request object containing requestType in params
     * @param res - Express response object
     */
    getZonesWithWorkflows(req: Request, res: Response): Promise<void>;
    /**
     * Retrieves unique depots configured with approval workflows for a request type.
     *
     * @param req - Express request object containing requestType in params
     * @param res - Express response object
     */
    getDepotsWithWorkflows(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=approvalWorkflowSetup.controller.d.ts.map