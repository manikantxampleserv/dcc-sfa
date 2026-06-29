import { Request, Response } from 'express';
export declare const ordersController: {
    createOrUpdateOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    approveOrRejectOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllOrders(req: any, res: any): Promise<void>;
    getOrdersById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateOrders(req: any, res: any): Promise<any>;
    deleteOrders(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getOrdersOrderItemsByOrderId(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=orders.controller.d.ts.map