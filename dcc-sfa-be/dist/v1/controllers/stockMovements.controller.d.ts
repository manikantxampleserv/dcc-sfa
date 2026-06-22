import { Request, Response } from 'express';
export declare const stockMovementsController: {
    createStockMovement(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllStockMovements(req: any, res: any): Promise<void>;
    getStockMovementById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateStockMovement(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteStockMovement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=stockMovements.controller.d.ts.map