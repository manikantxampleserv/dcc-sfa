import { Request, Response } from 'express';
export declare const loginHistoryController: {
    createLoginHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getLoginHistory(req: Request, res: Response): Promise<void>;
    getLoginHistoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateLoginHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteLoginHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=loginHistory.controller.d.ts.map