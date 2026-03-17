import { Request, Response } from 'express';
export declare const salesTargetsController: {
    createSalesTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllSalesTargets(req: any, res: any): Promise<void>;
    getSalesTargetById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSalesTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteSalesTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=salesTargets.controller.d.ts.map