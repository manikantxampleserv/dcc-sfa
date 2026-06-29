import { Request, Response } from 'express';
export declare const productTargetGroupsController: {
    createProductTargetGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductTargetGroups(req: Request, res: Response): Promise<void>;
    getProductTargetGroupById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProductTargetGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteProductTargetGroup(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductTargetGroupsDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=productTargetGroups.controller.d.ts.map