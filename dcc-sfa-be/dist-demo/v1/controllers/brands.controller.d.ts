import { Request, Response } from 'express';
export declare const brandsController: {
    createBrand(req: any, res: any): Promise<void>;
    getAllBrands(req: any, res: any): Promise<void>;
    getBrandById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateBrand(req: any, res: any): Promise<any>;
    deleteBrand(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=brands.controller.d.ts.map