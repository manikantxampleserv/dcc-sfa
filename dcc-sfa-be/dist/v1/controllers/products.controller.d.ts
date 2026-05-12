import { Request, Response } from 'express';
export declare const productsController: {
    createProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllProducts(req: any, res: any): Promise<void>;
    getProductById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProduct(req: any, res: any): Promise<any>;
    deleteProduct(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=products.controller.d.ts.map