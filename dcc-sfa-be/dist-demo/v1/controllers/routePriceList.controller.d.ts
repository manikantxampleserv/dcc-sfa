import { Request, Response } from 'express';
export declare const routePriceListController: {
    createRoutePriceList(req: any, res: any): Promise<void>;
    getAllRoutePriceList(req: any, res: any): Promise<void>;
    getRoutePriceListById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateRoutePriceList(req: any, res: any): Promise<any>;
    deleteRoutePriceList(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=routePriceList.controller.d.ts.map