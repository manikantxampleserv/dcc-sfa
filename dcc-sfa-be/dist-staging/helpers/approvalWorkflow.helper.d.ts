export interface CreateApprovalWorkflowParams {
    workflow_type: string;
    reference_type: string;
    reference_id: string;
    reference_number: string;
    requested_by: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    request_data?: any;
    steps?: WorkflowStepDefinition[];
    createdby?: number;
}
export interface WorkflowStepDefinition {
    step_number: number;
    step_name: string;
    assigned_role?: string;
    assigned_user_id?: number;
    is_required?: boolean;
    due_date?: Date;
}
/**
 * Create an approval workflow with steps
 */
export declare function createApprovalWorkflow(params: CreateApprovalWorkflowParams): Promise<{
    workflow_steps: {
        comments: string | null;
        id: number;
        is_active: string;
        createdate: Date | null;
        createdby: number;
        updatedate: Date | null;
        updatedby: number | null;
        log_inst: number | null;
        status: string | null;
        due_date: Date | null;
        workflow_id: number;
        step_number: number;
        step_name: string;
        assigned_role: string;
        assigned_user_id: number | null;
        processed_by: number | null;
        processed_at: Date | null;
        is_required: boolean | null;
    }[];
    users_approval_workflows_requested_byTousers: {
        name: string;
        id: number;
        email: string;
    };
} & {
    id: number;
    is_active: string;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    workflow_type: string;
    reference_id: string;
    reference_type: string;
    reference_number: string;
    requested_by: number;
    request_date: Date | null;
    priority: string | null;
    status: string | null;
    current_step: number | null;
    total_steps: number;
    request_data: string | null;
    final_approved_by: number | null;
    final_approved_at: Date | null;
    rejected_by: number | null;
    rejected_at: Date | null;
    rejection_reason: string | null;
}>;
export declare function createOrderApprovalWorkflow(orderId: number, orderNumber: string, requestedBy: number, priority?: 'low' | 'medium' | 'high' | 'urgent', orderData?: any, createdby?: number): Promise<{
    workflow_steps: {
        comments: string | null;
        id: number;
        is_active: string;
        createdate: Date | null;
        createdby: number;
        updatedate: Date | null;
        updatedby: number | null;
        log_inst: number | null;
        status: string | null;
        due_date: Date | null;
        workflow_id: number;
        step_number: number;
        step_name: string;
        assigned_role: string;
        assigned_user_id: number | null;
        processed_by: number | null;
        processed_at: Date | null;
        is_required: boolean | null;
    }[];
    users_approval_workflows_requested_byTousers: {
        name: string;
        id: number;
        email: string;
    };
} & {
    id: number;
    is_active: string;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    workflow_type: string;
    reference_id: string;
    reference_type: string;
    reference_number: string;
    requested_by: number;
    request_date: Date | null;
    priority: string | null;
    status: string | null;
    current_step: number | null;
    total_steps: number;
    request_data: string | null;
    final_approved_by: number | null;
    final_approved_at: Date | null;
    rejected_by: number | null;
    rejected_at: Date | null;
    rejection_reason: string | null;
}>;
export declare function createAssetMovementApprovalWorkflow(assetMovementId: number, movementNumber: string, requestedBy: number, priority?: 'low' | 'medium' | 'high' | 'urgent', assetMovementData?: any, createdby?: number): Promise<{
    workflow_steps: {
        comments: string | null;
        id: number;
        is_active: string;
        createdate: Date | null;
        createdby: number;
        updatedate: Date | null;
        updatedby: number | null;
        log_inst: number | null;
        status: string | null;
        due_date: Date | null;
        workflow_id: number;
        step_number: number;
        step_name: string;
        assigned_role: string;
        assigned_user_id: number | null;
        processed_by: number | null;
        processed_at: Date | null;
        is_required: boolean | null;
    }[];
    users_approval_workflows_requested_byTousers: {
        name: string;
        id: number;
        email: string;
    };
} & {
    id: number;
    is_active: string;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    workflow_type: string;
    reference_id: string;
    reference_type: string;
    reference_number: string;
    requested_by: number;
    request_date: Date | null;
    priority: string | null;
    status: string | null;
    current_step: number | null;
    total_steps: number;
    request_data: string | null;
    final_approved_by: number | null;
    final_approved_at: Date | null;
    rejected_by: number | null;
    rejected_at: Date | null;
    rejection_reason: string | null;
}>;
export declare function generateContractOnApproval(assetMovementId: number): Promise<any>;
//# sourceMappingURL=approvalWorkflow.helper.d.ts.map