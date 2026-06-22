import { Request, Response } from 'express';
export declare const assetWarrantyClaimsController: {
    createAssetWarrantyClaims(req: any, res: any): Promise<any>;
    getAllAssetWarrantyClaims(req: any, res: any): Promise<void>;
    getAssetWarrantyClaimsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAssetWarrantyClaims(req: any, res: any): Promise<any>;
    deleteAssetWarrantyClaims(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=assetWarrantyClaims.controller.d.ts.map