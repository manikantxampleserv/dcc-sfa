export interface WorkflowStep {
    id: number;
    request_type: string;
    request_id: number;
    step: string;
    status: string;
    remarks?: string | null;
    action_by?: number | null;
    action_date?: Date | null;
    is_active: string;
    createdate?: Date | null;
    createdby: number;
    updatedate?: Date | null;
    updatedby?: number | null;
    log_inst?: number | null;
    action_user?: {
        id: number;
        name: string;
        email: string;
    } | null;
}
export declare class ReturnWorkflowService {
    /**
     * Get workflow steps for a return request
     * @param requestId - The ID of the return request
     * @returns Promise<WorkflowStep[]> - Array of workflow steps
     */
    static getWorkflowSteps(requestId: number): Promise<WorkflowStep[]>;
    /**
     * Create initial workflow steps for a return request
     * @param requestId - The ID of the return request
     * @param userId - The ID of the user creating the workflow
     * @returns Promise<void>
     */
    static createInitialWorkflow(requestId: number, userId: number): Promise<void>;
    /**
     * Update workflow step status
     * @param stepId - The ID of the workflow step
     * @param status - The new status for the step
     * @param remarks - Optional remarks for the step
     * @param actionBy - Optional user ID who performed the action
     * @returns Promise<WorkflowStep> - Updated workflow step
     */
    static updateWorkflowStep(stepId: number, status: string, remarks?: string, actionBy?: number): Promise<WorkflowStep>;
    /**
     * Add a new workflow step
     * @param requestId - The ID of the return request
     * @param step - The name of the workflow step
     * @param status - The status of the step
     * @param remarks - Remarks for the step
     * @param actionBy - User ID who performed the action (null for system/auto assignment)
     * @param userId - User ID who created the step
     * @returns Promise<WorkflowStep> - New workflow step
     */
    static addWorkflowStep(requestId: number, step: string, status: string, remarks: string, actionBy: number | null, userId: number): Promise<WorkflowStep>;
    /**
     * Get workflow step by step name and request ID
     * @param requestId - The ID of the return request
     * @param step - The name of the workflow step
     * @returns Promise<WorkflowStep | null> - Workflow step or null if not found
     */
    static getWorkflowStepByStep(requestId: number, step: string): Promise<WorkflowStep | null>;
    /**
     * Execute full workflow flow - automatically progress through all steps
     * @param requestId - The ID of the return request
     * @param userId - The ID of the user executing the workflow
     * @param templateId - The template ID to use (default: 'standard_return')
     * @returns Promise<WorkflowStep[]> - Array of completed workflow steps
     */
    static executeFullWorkflowFlow(requestId: number, userId: number, templateId?: string): Promise<WorkflowStep[]>;
    /**
     * Reject return request with reason
     * @param requestId - The ID of the return request
     * @param userId - The ID of the user rejecting the request
     * @param rejectionReason - The reason for rejection
     * @returns Promise<WorkflowStep> - Rejection workflow step
     */
    static rejectReturnRequest(requestId: number, userId: number, rejectionReason: string): Promise<WorkflowStep>;
    /**
     * Execute next workflow step automatically
     * @param requestId - The ID of the return request
     * @param userId - The ID of the user executing the step
     * @returns Promise<WorkflowStep | null> - Next executed step or null if all completed
     */
    static executeNextWorkflowStep(requestId: number, userId: number): Promise<WorkflowStep | null>;
}
//# sourceMappingURL=returnWorkflow.service.d.ts.map