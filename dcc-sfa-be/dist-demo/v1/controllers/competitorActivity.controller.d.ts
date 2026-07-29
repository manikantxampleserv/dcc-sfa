import { Request, Response } from 'express';
export declare const competitorActivityController: {
    createCompetitorActivity(req: any, res: any): Promise<any>;
    getCompetitorActivities(req: Request, res: Response): Promise<void>;
    getCompetitorActivityById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCompetitorActivity(req: any, res: any): Promise<any>;
    deleteCompetitorActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=competitorActivity.controller.d.ts.map