import { Request, Response } from 'express';
export declare const vanInventoryController: {
    getSalespersonInventoryItems(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSalespersonInventoryItemsDropdown(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAvailableBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createOrUpdateVanInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllVanInventory(req: any, res: any): Promise<void>;
    getVanInventoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateVanInventory(req: any, res: any): Promise<any>;
    deleteVanInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getVanInventoryItems(req: Request, res: Response): Promise<void>;
    updateVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    bulkUpdateVanInventoryItems(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductBatchDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getBulkProductBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getSalespersonInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getinventoryItemSalesperson(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=vanInventory.controller.d.ts.map