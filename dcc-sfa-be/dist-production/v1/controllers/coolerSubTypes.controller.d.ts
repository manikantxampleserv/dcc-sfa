import { Request, Response } from 'express';
export declare const coolerSubTypesController: {
    createCoolerSubType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCoolerSubTypes(req: Request, res: Response): Promise<void>;
    getCoolerSubTypeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCoolerSubType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCoolerSubType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCoolerSubTypesDropdown(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=coolerSubTypes.controller.d.ts.map