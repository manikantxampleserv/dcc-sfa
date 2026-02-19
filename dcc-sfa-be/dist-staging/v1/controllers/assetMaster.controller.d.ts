import { Request, Response } from 'express';
export declare const assetMasterController: {
    createAssetMaster(req: any, res: any): Promise<any>;
    getAllAssetMaster(req: any, res: any): Promise<void>;
    getAssetMasterById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAssetMaster(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteAssetMaster(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=assetMaster.controller.d.ts.map