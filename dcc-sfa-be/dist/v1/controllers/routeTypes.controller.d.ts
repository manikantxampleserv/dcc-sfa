import { Request, Response } from 'express';
export declare const routeTypesController: {
    createRouteType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllRouteTypes(req: any, res: any): Promise<void>;
    getRouteTypeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateRouteType(req: any, res: any): Promise<any>;
    deleteRouteType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=routeTypes.controller.d.ts.map