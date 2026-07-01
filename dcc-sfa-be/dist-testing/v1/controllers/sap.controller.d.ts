import { Request, Response } from 'express';
export declare const sapController: {
    syncVanInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    searchUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    searchLocations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    searchVehicles(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    searchProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateVanInventoryCancellation(req: any, res: any): Promise<any>;
    updateVanInventoryItemCancellation(req: any, res: any): Promise<any>;
};
//# sourceMappingURL=sap.controller.d.ts.map