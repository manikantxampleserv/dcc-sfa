import { Request, Response } from 'express';
export declare const coolerInstallationsController: {
    createCoolerInstallation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCoolerInstallations(req: Request, res: Response): Promise<void>;
    getCoolerInstallationById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCoolerInstallation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCoolerInstallation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCoolerStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCoolerStatusOptions(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=coolerInstallations.controller.d.ts.map