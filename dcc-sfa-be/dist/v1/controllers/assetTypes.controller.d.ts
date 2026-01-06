import { Request, Response } from 'express';
export declare const assetTypesController: {
    createAssetType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAssetTypes(req: Request, res: Response): Promise<void>;
    getAssetTypeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAssetType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteAssetType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=assetTypes.controller.d.ts.map