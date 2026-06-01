import { Request, Response } from 'express';
export declare const vehiclesController: {
    createVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getVehicles(req: Request, res: Response): Promise<void>;
    getVehicleById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=vehicles.controller.d.ts.map