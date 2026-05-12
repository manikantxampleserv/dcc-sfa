import { Request, Response } from 'express';
export declare const templatesController: {
    createTemplates(req: any, res: any): Promise<void>;
    getTemplates(req: any, res: any): Promise<void>;
    getTemplatesById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateTemplates(req: any, res: any): Promise<any>;
    deleteTemplates(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=templates.controller.d.ts.map