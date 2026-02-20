import { Request, Response } from 'express';
export declare const coolerTypesController: {
    createCoolerType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCoolerTypes(req: Request, res: Response): Promise<void>;
    getCoolerTypeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCoolerType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCoolerType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCoolerTypesDropdown(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=coolerTypes.controller.d.ts.map