import { Request, Response } from 'express';
export declare const kpiTargetsController: {
    createKpiTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllKpiTargets(req: any, res: any): Promise<void>;
    getKpiTargetById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateKpiTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteKpiTarget(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=kpiTargets.controller.d.ts.map