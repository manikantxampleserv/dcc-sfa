import { Request, Response } from 'express';
export declare const currenciesController: {
    createCurrencies(req: any, res: any): Promise<void>;
    getAllCurrencies(req: any, res: any): Promise<void>;
    getCurrenciesById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCurrencies(req: any, res: any): Promise<any>;
    deleteCurrencies(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=currencies.controller.d.ts.map