import { Request, Response } from 'express';
export declare const surveysController: {
    createOrUpdateSurvey(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllSurveys(req: any, res: any): Promise<void>;
    getSurveyById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteSurvey(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    publishSurvey(req: any, res: any): Promise<any>;
    getSurveyFields(req: Request, res: Response): Promise<void>;
    duplicateSurvey(req: any, res: any): Promise<any>;
};
//# sourceMappingURL=surveys.controller.d.ts.map