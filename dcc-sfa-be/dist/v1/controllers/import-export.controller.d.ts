import { Request, Response, NextFunction } from 'express';
export declare const importExportController: {
    getSupportedTables(req: Request, res: Response, next: NextFunction): Promise<void>;
    downloadTemplate(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    importData(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    previewImport(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    exportToExcel(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    exportToPDF(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=import-export.controller.d.ts.map