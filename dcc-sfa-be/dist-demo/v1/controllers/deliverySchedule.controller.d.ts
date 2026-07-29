import { Request, Response } from 'express';
export declare const deliverySchedulesController: {
    createDeliverySchedule(req: any, res: any): Promise<void>;
    getAllDeliverySchedules(req: any, res: any): Promise<void>;
    getDeliveryScheduleById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateDeliverySchedule(req: any, res: any): Promise<any>;
    deleteDeliverySchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=deliverySchedule.controller.d.ts.map