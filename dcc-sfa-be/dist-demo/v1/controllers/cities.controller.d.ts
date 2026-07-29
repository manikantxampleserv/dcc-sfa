import { Request, Response } from 'express';
export declare const citiesController: {
    createCities(req: any, res: any): Promise<any>;
    getAllCities(req: any, res: any): Promise<void>;
    getCitiesById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCities(req: any, res: any): Promise<any>;
    deleteCities(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=cities.controller.d.ts.map