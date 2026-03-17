import { Request, Response } from 'express';
export declare const customerDocumentsController: {
    createCustomerDocuments(req: any, res: any): Promise<void>;
    getAllCustomerDocuments(req: any, res: any): Promise<void>;
    getCustomerDocumentsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCustomerDocuments(req: any, res: any): Promise<any>;
    deleteCustomerDocuments(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=customerDocuments.controller.d.ts.map