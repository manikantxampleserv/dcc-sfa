import { Request, Response } from 'express';
export declare const assetBrandsController: {
    createAssetBrand(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAssetBrands(req: Request, res: Response): Promise<void>;
    getAssetBrandById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAssetBrand(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteAssetBrand(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAssetBrandsDropdown(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=assetBrands.controller.d.ts.map