import { Request, Response } from 'express';
export declare const salesTargetOverridesController: {
    createSalesTargetOverride(req: Request, res: Response): Promise<void>;
    getAllSalesTargetOverrides(req: any, res: any): Promise<void>;
    getSalesTargetOverrideById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSalesTargetOverride(req: any, res: any): Promise<any>;
    deleteSalesTargetOverride(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=salesTargetOverrides.controller.d.ts.map