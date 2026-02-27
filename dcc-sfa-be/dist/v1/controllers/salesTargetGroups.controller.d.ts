import { Request, Response } from 'express';
export declare const salesTargetGroupsController: {
    createSalesTargetGroups(req: any, res: any): Promise<void>;
    getAllSalesTargetGroups(req: any, res: any): Promise<void>;
    getSalesTargetGroupsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSalesTargetGroups(req: any, res: any): Promise<any>;
    deleteSalesTargetGroups(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=salesTargetGroups.controller.d.ts.map