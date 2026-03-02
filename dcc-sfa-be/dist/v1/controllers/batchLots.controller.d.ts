import { Request, Response } from 'express';
export declare const batchLotsController: {
    createMultipleBatchLotsForProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createBatchLot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllBatchLots(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBatchLotById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateBatchLot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteBatchLot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBatchLotsDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=batchLots.controller.d.ts.map