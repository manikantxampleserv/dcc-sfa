export declare const approvalWorkflowsController: {
    /**
     * Get all approval workflows
     * GET /api/v1/approval-workflows
     */
    getApprovalWorkflows(req: any, res: any): Promise<any>;
    /**
     * Get approval workflow by ID
     * GET /api/v1/approval-workflows/:id
     */
    getApprovalWorkflowById(req: any, res: any): Promise<any>;
    /**
     * Approve a workflow step
     * POST /api/v1/approval-workflows/:id/approve
     */
    approveWorkflowStep(req: any, res: any): Promise<any>;
    /**
     * Reject a workflow step
     * POST /api/v1/approval-workflows/:id/reject
     */
    rejectWorkflowStep(req: any, res: any): Promise<any>;
};
//# sourceMappingURL=approvalWorkflows.controller.d.ts.map