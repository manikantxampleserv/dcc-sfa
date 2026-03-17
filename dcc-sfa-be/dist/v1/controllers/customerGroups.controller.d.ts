import { Request, Response } from 'express';
export declare const customerGroupsController: {
    createCustomerGroups(req: Request, res: Response): Promise<void>;
    getAllCustomerGroups(req: any, res: any): Promise<void>;
    getCustomerGroupsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCustomerGroups(req: any, res: any): Promise<any>;
    deleteCustomerGroups(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=customerGroups.controller.d.ts.map