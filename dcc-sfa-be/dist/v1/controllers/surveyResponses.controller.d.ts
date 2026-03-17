import { Request, Response } from 'express';
export declare const surveyResponseController: {
    createOrUpdateSurveyResponse(req: any, res: any): Promise<any>;
    createBulkSurveyResponses(req: any, res: any): Promise<any>;
    getAllSurveyResponses(req: any, res: any): Promise<void>;
    getSurveyResponseById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteSurveyResponse(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getSurveyAnswers(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=surveyResponses.controller.d.ts.map