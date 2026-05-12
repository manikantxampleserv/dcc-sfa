import { Request, Response } from 'express';
export declare const approvalWorkflowSetupController: {
    createApprovalWorkFlow(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getApprovalWorkFlowById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateApprovalWorkFlow(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteApprovalWorkFlow(req: Request, res: Response): Promise<void>;
    deleteApprovalWorkFlows(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllApprovalWorkFlow(req: any, res: any): Promise<void>;
    getAllApprovalWorkFlowByRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getZonesWithWorkflows(req: Request, res: Response): Promise<void>;
    getDepotsWithWorkflows(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=approvalWorkflowSetup.controller.d.ts.map