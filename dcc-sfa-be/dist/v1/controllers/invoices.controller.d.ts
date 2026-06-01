import { Request, Response } from 'express';
export declare const invoicesController: {
    createInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getInvoices(req: Request, res: Response): Promise<void>;
    getInvoiceById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteInvoice(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createInvoicePaymentLine(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getInvoicePaymentLines(req: Request, res: Response): Promise<void>;
    updateInvoicePaymentLine(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteInvoicePaymentLine(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    bulkUpdateInvoicePaymentLines(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createInvoiceItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getInvoiceItems(req: Request, res: Response): Promise<void>;
    updateInvoiceItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteInvoiceItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    bulkUpdateInvoiceItems(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=invoices.controller.d.ts.map