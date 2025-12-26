import { Request, Response } from 'express';
export declare const productSubCategoriesController: {
    createProductSubCategories(req: any, res: Response): Promise<void>;
    getAllProductSubCategories(req: any, res: any): Promise<void>;
    getProductSubCategoriesById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProductSubCategories(req: any, res: any): Promise<any>;
    deleteProductSubCategories(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=productSubCategories.controller.d.ts.map