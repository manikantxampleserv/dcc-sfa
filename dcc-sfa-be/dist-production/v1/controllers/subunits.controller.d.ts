import { Request, Response } from 'express';
export declare const subunitsController: {
    createSubunit(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getSubunits(req: any, res: any): Promise<void>;
    getSubunitById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSubunit(req: any, res: any): Promise<any>;
    deleteSubunit(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUnitsOfMeasurement(req: Request, res: Response): Promise<void>;
    getProducts(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=subunits.controller.d.ts.map