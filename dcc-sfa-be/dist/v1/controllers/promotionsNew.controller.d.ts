import { Request, Response } from 'express';
export declare const promotionsNewController: {
    createPromotion(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllPromotions(req: any, res: Response): Promise<void>;
    getPromotionById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePromotion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePromotion(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=promotionsNew.controller.d.ts.map