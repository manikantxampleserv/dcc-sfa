import { Request, Response } from 'express';
export declare const unitMeasurementController: {
    createUnitMeasurement(req: any, res: any): Promise<void>;
    getAllUnitMeasurement(req: any, res: any): Promise<void>;
    getUnitMeasurementById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateUnitMeasurement(req: any, res: any): Promise<any>;
    deleteUnitMeasurement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=unitMeasurement.controller.d.ts.map