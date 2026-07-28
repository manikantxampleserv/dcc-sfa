import { Request, Response } from 'express';
export declare const alertsController: {
    getAllAlerts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAlertById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createAlert(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateAlert(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteAlert(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    processAlert(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    bulkProcessAlerts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAlertStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=alerts.controller.d.ts.map