import { Request, Response } from 'express';
export declare const depotsController: {
    createDepots(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getDepots(req: Request, res: Response): Promise<void>;
    getDepotsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateDepots(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteDepots(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=depots.controller.d.ts.map