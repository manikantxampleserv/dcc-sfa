import { Request, Response } from 'express';
export declare const districtsController: {
    createDistricts(req: any, res: any): Promise<any>;
    getAllDistricts(req: any, res: any): Promise<void>;
    getDistrictsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateDistricts(req: any, res: any): Promise<any>;
    deleteDistricts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=districts.controller.d.ts.map