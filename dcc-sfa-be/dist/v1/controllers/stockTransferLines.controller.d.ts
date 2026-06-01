import { Request, Response } from 'express';
export declare const stockTransferLinesController: {
    getAllStockTransferLines(req: any, res: any): Promise<void>;
    getStockTransferLineById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateStockTransferLine(req: any, res: any): Promise<any>;
    deleteStockTransferLine(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=stockTransferLines.controller.d.ts.map