import { Request, Response } from 'express';
export declare const productFlavoursController: {
    createProductFlavour(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductFlavours(req: Request, res: Response): Promise<void>;
    getProductFlavourById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProductFlavour(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteProductFlavour(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductFlavoursDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=productFlavours.controller.d.ts.map