import { Request, Response } from 'express';
export declare const assetImagesController: {
    createAssetImages(req: any, res: any): Promise<any>;
    getAllAssetImages(req: any, res: any): Promise<void>;
    getAssetImagesById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAssetImages(req: any, res: any): Promise<any>;
    deleteAssetImages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=assetImages.controller.d.ts.map