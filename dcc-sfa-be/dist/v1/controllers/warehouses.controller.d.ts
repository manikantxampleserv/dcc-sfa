import { Request, Response } from 'express';
export declare const warehousesController: {
    createWarehouse(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getWarehouses(req: Request, res: Response): Promise<void>;
    getWarehouseById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateWarehouse(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteWarehouse(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=warehouses.controller.d.ts.map