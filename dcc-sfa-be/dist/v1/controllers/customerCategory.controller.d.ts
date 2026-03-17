import { Request, Response } from 'express';
export declare const customerCategoryController: {
    bulkCustomerCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllCustomerCategory(req: any, res: any): Promise<any>;
    getCustomerCategoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteCustomerCategory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    assignCategoriesToCustomers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    assignCategoryToSingleCustomer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCategoryAssignmentStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=customerCategory.controller.d.ts.map