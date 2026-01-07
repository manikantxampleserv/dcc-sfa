import { Request, Response } from 'express';
export declare const workflowController: {
    /**
     * Get all workflow steps for a return request
     * @param req - Express request object
     * @param res - Express response object
     */
    getWorkflowSteps(req: Request, res: Response): Promise<void>;
    /**
     * Execute workflow action (approve, reject, process, complete)
     * @param req - Express request object containing action, remarks, actionBy in body
     * @param res - Express response object
     */
    executeWorkflowAction(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get workflow templates
     * @param req - Express request object
     * @param res - Express response object
     */
    getWorkflowTemplates(req: Request, res: Response): Promise<void>;
    /**
     * Apply workflow template to a return request
     * @param req - Express request object containing templateId in body
     * @param res - Express response object
     */
    applyWorkflowTemplate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Execute full workflow flow - automatically progress through all steps
     * @param req - Express request object containing templateId in body
     * @param res - Express response object
     */
    executeFullWorkflowFlow(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Reject return request with reason
     * @param req - Express request object
     * @param res - Express response object
     */
    rejectReturnRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Execute next workflow step automatically
     * @param req - Express request object
     * @param res - Express response object
     */
    executeNextWorkflowStep(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=workflow.controller.d.ts.map