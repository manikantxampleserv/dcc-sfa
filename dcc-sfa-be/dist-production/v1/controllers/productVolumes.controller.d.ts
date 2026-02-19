import { Request, Response } from 'express';
export declare const productVolumesController: {
    createProductVolume(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductVolumes(req: Request, res: Response): Promise<void>;
    getProductVolumeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProductVolume(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteProductVolume(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductVolumesDropdown(req: any, res: any): Promise<void>;
};
//# sourceMappingURL=productVolumes.controller.d.ts.map