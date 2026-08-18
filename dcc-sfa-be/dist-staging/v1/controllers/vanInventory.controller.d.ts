import { Request, Response } from 'express';
export declare const vanInventoryController: {
    /**
     * Controller method to processApprovedVanInventoryStock
     * @param inventoryId
     * @param userId
     * @param requestData
     */
    processApprovedVanInventoryStock(inventoryId: number, userId: number, requestData?: any): Promise<void>;
    /**
     * Controller method to getSalespersonInventoryItems
     * @param req
     * @param res
     */
    getSalespersonInventoryItems(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Controller method to getSalespersonInventoryItemsDropdown
     * @param req
     * @param res
     */
    getSalespersonInventoryItemsDropdown(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Controller method to getAvailableBatches
     * @param req
     * @param res
     */
    getAvailableBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to createOrUpdateVanInventory
     * @param req
     * @param res
     */
    createOrUpdateVanInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to getAllVanInventory
     * @param req
     * @param res
     */
    getAllVanInventory(req: any, res: any): Promise<void>;
    /**
     * Controller method to getVanInventoryById
     * @param req
     * @param res
     */
    getVanInventoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to updateVanInventory
     * @param req
     * @param res
     */
    updateVanInventory(req: any, res: any): Promise<any>;
    /**
     * Controller method to deleteVanInventory
     * @param req
     * @param res
     */
    deleteVanInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to createVanInventoryItem
     * @param req
     * @param res
     */
    createVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to getVanInventoryItems
     * @param req
     * @param res
     */
    getVanInventoryItems(req: Request, res: Response): Promise<void>;
    /**
     * Controller method to updateVanInventoryItem
     * @param req
     * @param res
     */
    updateVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to deleteVanInventoryItem
     * @param req
     * @param res
     */
    deleteVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to bulkUpdateVanInventoryItems
     * @param req
     * @param res
     */
    bulkUpdateVanInventoryItems(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to getProductBatches
     * @param req
     * @param res
     */
    getProductBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to getProductBatchDetails
     * @param req
     * @param res
     */
    getProductBatchDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to getBulkProductBatches
     * @param req
     * @param res
     */
    getBulkProductBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to getSalespersonInventory
     * @param req
     * @param res
     */
    getSalespersonInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to getinventoryItemSalesperson
     * @param req
     * @param res
     */
    getinventoryItemSalesperson(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Controller method to createVanInventoryFromReconciliation
     * @param reconciliationId
     * @param approvedByUserId
     */
    createVanInventoryFromReconciliation(reconciliationId: number, approvedByUserId: number): Promise<number | null>;
    /**
     * Controller method to unloadVanInventory
     * @param req
     * @param res
     */
    unloadVanInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Controller method to getProducts
     * @param req
     * @param res
     */
    getProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=vanInventory.controller.d.ts.map