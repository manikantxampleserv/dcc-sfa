import { Request, Response } from 'express';
export declare const visitTasksController: {
    createVisitTasks(req: any, res: any): Promise<any>;
    getAllVisitTasks(req: any, res: any): Promise<void>;
    getVisitTasksById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateVisitTasks(req: any, res: any): Promise<any>;
    deleteVisitTasks(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=visitTasks.controller.d.ts.map