import { Request, Response } from 'express';
export declare const priceListsController: {
    upsertPriceList(req: Request, res: Response): Promise<void>;
    getAllPriceLists(req: any, res: any): Promise<void>;
    getPriceListsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePriceLists(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=priceLists.controller.d.ts.map