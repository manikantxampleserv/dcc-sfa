import { Request, Response } from 'express';
export declare const promotionParametersController: {
    createPromotionParameter(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllPromotionParameters(req: any, res: any): Promise<void>;
    getPromotionParameterById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePromotionParameter(req: any, res: any): Promise<any>;
    deletePromotionParameter(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=promotionParameters.controller.d.ts.map