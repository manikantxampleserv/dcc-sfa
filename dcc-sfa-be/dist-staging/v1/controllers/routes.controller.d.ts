import { Request, Response } from 'express';
export declare const routesController: {
    getRouteAssignments(req: any, res: any): Promise<void>;
    getRouteAssignmentsByUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    setRouteAssignmentsForUser(req: any, res: any): Promise<any>;
    createRoutes(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getRoutes(req: any, res: any): Promise<void>;
    getRoutesById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateRoutes(req: any, res: any): Promise<any>;
    deleteRoutes(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=routes.controller.d.ts.map