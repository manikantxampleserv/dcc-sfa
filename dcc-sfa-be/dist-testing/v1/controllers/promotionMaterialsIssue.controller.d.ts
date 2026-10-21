import { Request, Response } from 'express';
export declare const promotionMaterialsIssueController: {
    getPromotionMaterialsIssues(req: Request, res: Response): Promise<void>;
    getPromotionMaterialsIssueById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createPromotionMaterialsIssue(req: any, res: Response): Promise<void>;
    updatePromotionMaterialsIssue(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePromotionMaterialsIssue(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Generates and returns the Goods Issue Note printable document matching exact template.
     */
    getGoodsIssueNote(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=promotionMaterialsIssue.controller.d.ts.map