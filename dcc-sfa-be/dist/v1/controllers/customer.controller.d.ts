import { Request, Response } from 'express';
export declare const customerController: {
    uploadCustomerImages(req: any, res: any): Promise<any>;
    bulkUpsertCustomers(req: any, res: any): Promise<any>;
    createCustomers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllCustomers(req: any, res: any): Promise<void>;
    getCustomersById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCustomers(req: any, res: any): Promise<any>;
    deleteCustomers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCustomersDropdown(req: any, res: any): Promise<void>;
    getCustomerRelations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=customer.controller.d.ts.map