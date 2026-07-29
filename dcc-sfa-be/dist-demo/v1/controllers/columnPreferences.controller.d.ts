import { Request, Response } from 'express';
export interface ColumnPreferences {
    [columnName: string]: boolean;
}
export declare const columnPreferencesController: {
    getAllUserPreferences(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    saveColumnPreferences(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=columnPreferences.controller.d.ts.map