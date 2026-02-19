import { Request, Response } from 'express';
export declare const customerAssetsController: {
    createCustomerAsset(req: any, res: any): Promise<void>;
    getAllCustomerAssets(req: any, res: any): Promise<void>;
    getCustomerAssetById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCustomerAsset(req: any, res: any): Promise<any>;
    deleteCustomerAsset(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=customerAssets.controller.d.ts.map