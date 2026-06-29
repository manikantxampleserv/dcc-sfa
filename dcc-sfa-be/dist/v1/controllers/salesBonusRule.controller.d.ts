import { Request, Response } from 'express';
export declare const salesBonusRulesController: {
    createSalesBonusRule(req: any, res: any): Promise<void>;
    getAllSalesBonusRules(req: any, res: any): Promise<void>;
    getSalesBonusRuleById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSalesBonusRule(req: any, res: any): Promise<any>;
    deleteSalesBonusRule(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=salesBonusRule.controller.d.ts.map