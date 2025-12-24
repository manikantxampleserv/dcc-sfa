import { Request, Response } from 'express';
export declare const coolerInspectionsController: {
    createCoolerInspection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCoolerInspections(req: Request, res: Response): Promise<void>;
    getCoolerInspectionById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCoolerInspection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCoolerInspection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCoolerInspectionStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCoolerInspectionStatusOptions(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=coolerInspections.controller.d.ts.map