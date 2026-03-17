import { Request, Response } from 'express';
export declare const priceListItemsController: {
    createPriceListItems(req: any, res: any): Promise<void>;
    getAllPriceListItems(req: any, res: any): Promise<void>;
    getPriceListItemsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePriceListItems(req: any, res: any): Promise<any>;
    deletePriceListItems(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=priceListsItems.controller.d.ts.map