import { Request, Response } from 'express';
export declare const productWebOrdersController: {
    createProductWebOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductWebOrders(req: Request, res: Response): Promise<void>;
    getProductWebOrderById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProductWebOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteProductWebOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductWebOrdersDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=productWebOrders.controller.d.ts.map