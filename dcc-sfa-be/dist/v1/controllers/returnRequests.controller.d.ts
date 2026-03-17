import { Request, Response } from 'express';
export declare const returnRequestsController: {
    createReturnRequest(req: Request, res: Response): Promise<void>;
    getAllReturnRequests(req: Request, res: Response): Promise<void>;
    getReturnRequestById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateReturnRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteReturnRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=returnRequests.controller.d.ts.map