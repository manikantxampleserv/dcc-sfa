import { Request, Response } from 'express';
export declare const paymentsController: {
    createPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPayments(req: Request, res: Response): Promise<void>;
    getPaymentById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createPaymentLine(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPaymentLines(req: Request, res: Response): Promise<void>;
    deletePaymentLine(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createPaymentRefund(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPaymentRefunds(req: Request, res: Response): Promise<void>;
    updatePaymentRefund(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePaymentRefund(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=payments.controller.d.ts.map