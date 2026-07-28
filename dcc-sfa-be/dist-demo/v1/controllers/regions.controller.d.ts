import { Request, Response } from 'express';
export declare const regionsController: {
    createRegions(req: any, res: any): Promise<any>;
    getAllRegions(req: any, res: any): Promise<void>;
    getRegionsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateRegions(req: any, res: any): Promise<any>;
    deleteRegions(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=regions.controller.d.ts.map