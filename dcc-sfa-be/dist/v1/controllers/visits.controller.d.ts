import { Request, Response } from 'express';
export declare const visitsController: {
    createVisits(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    bulkUpsertVisits(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllVisits(req: any, res: any): Promise<any>;
    getVisitsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateVisits(req: any, res: any): Promise<any>;
    deleteVisits(req: any, res: any): Promise<any>;
    getCustomerVisitsBySalesperson(req: any, res: any): Promise<any>;
    getCoolerInspectionsForVisitedCustomers(req: any, res: any): Promise<any>;
};
//# sourceMappingURL=visits.controller.d.ts.map