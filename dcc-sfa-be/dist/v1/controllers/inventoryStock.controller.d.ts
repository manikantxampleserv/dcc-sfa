import { Request, Response } from 'express';
export declare const inventoryStockController: {
    createInventoryStock(req: Request, res: Response): Promise<void>;
    getAllInventoryStock(req: any, res: any): Promise<void>;
    getInventoryStockById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateInventoryStock(req: any, res: any): Promise<any>;
    deleteInventoryStock(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=inventoryStock.controller.d.ts.map