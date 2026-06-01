import { Request, Response } from 'express';
export declare const productTypesController: {
    createProductType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductTypes(req: Request, res: Response): Promise<void>;
    getProductTypeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProductType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteProductType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductTypesDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=productTypes.controller.d.ts.map