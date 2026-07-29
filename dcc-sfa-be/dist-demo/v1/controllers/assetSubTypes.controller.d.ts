import { Request, Response } from 'express';
export declare const assetSubTypesController: {
    createAssetSubType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAssetSubTypes(req: Request, res: Response): Promise<void>;
    getAssetSubTypeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAssetSubType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteAssetSubType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAssetSubTypesDropdown(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=assetSubTypes.controller.d.ts.map