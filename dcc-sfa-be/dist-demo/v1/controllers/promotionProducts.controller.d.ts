import { Request, Response } from 'express';
export declare const promotionProductsController: {
    createPromotionProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllPromotionProducts(req: any, res: any): Promise<void>;
    getPromotionProductById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePromotionProduct(req: any, res: any): Promise<any>;
    deletePromotionProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=promotionProducts.controller.d.ts.map