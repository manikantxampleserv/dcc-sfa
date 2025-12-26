import { Request, Response } from 'express';
export declare const competitorActivityController: {
    createCompetitorActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCompetitorActivities(req: Request, res: Response): Promise<void>;
    getCompetitorActivityById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCompetitorActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteCompetitorActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=competitorActivity.controller.d.ts.map