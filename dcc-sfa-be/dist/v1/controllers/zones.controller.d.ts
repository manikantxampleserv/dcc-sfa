import { Request, Response } from 'express';
import '../../types/express';
export declare const zonesController: {
    createZone(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getZones(req: any, res: any): Promise<void>;
    getZoneById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateZone(req: any, res: any): Promise<any>;
    deleteZone(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=zones.controller.d.ts.map