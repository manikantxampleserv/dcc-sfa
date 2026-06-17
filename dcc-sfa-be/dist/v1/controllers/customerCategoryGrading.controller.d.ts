import { Request, Response } from 'express';
export declare const customerCategoryGradingController: {
    getGradingRequestById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    processGradingRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    bulkProcessGradingRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllGradingRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getGradingStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=customerCategoryGrading.controller.d.ts.map