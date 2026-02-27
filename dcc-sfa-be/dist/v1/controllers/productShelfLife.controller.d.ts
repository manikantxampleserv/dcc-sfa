import { Request, Response } from 'express';
export declare const productShelfLifeController: {
    createProductShelfLife(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductShelfLife(req: Request, res: Response): Promise<void>;
    getProductShelfLifeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProductShelfLife(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteProductShelfLife(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductShelfLifeDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=productShelfLife.controller.d.ts.map