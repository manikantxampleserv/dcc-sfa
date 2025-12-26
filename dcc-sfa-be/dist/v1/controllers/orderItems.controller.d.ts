import { Request, Response } from 'express';
export declare const orderItemsController: {
    createOrderItems(req: any, res: any): Promise<void>;
    getAllOrderItems(req: any, res: any): Promise<void>;
    getOrderItemsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateOrderItems(req: any, res: any): Promise<any>;
    deleteOrderItems(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=orderItems.controller.d.ts.map