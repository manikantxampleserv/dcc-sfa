import { Request, Response } from 'express';
export declare const productCategoriesController: {
    createProductCategories(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllProductCategories(req: any, res: any): Promise<void>;
    getProductCategoriesById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProductCategories(req: any, res: any): Promise<any>;
    deleteProductCategories(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductCategoriesDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=productCategories.controller.d.ts.map