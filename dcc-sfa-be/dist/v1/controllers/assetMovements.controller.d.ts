import type { Request, Response } from 'express';
export declare const assetMovementsController: {
    createAssetMovements(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllAssetMovements(req: any, res: any): Promise<void>;
    getAssetMovementsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAssetMovements(req: any, res: any): Promise<any>;
    deleteAssetMovements(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    generateContract(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    downloadContract(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getContractInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=assetMovements.controller.d.ts.map