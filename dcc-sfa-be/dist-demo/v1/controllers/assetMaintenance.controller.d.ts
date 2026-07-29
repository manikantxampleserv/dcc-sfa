import { Request, Response } from 'express';
export declare const assetMaintenanceController: {
    createAssetMaintenance(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllAssetMaintenance(req: any, res: any): Promise<void>;
    getAssetMaintenanceById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAssetMaintenance(req: any, res: any): Promise<any>;
    deleteAssetMaintenance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=assetMaintenance.controller.d.ts.map