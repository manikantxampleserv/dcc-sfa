import { Request, Response } from 'express';
export declare const stockTransferRequestsController: {
    upsertStockTransferRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllStockTransferRequests(req: any, res: any): Promise<void>;
    getStockTransferRequestById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteStockTransferRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=stockTransferRequests.controller.d.ts.map