import { Request, Response } from 'express';
export declare const createRequest: (data: {
    requester_id: number;
    request_type: string;
    reference_id?: number | null;
    request_data?: string | null;
    createdby: number;
    log_inst: number;
}) => Promise<{
    id: number;
    createdate: Date | null;
    createdby: number;
    updatedate: Date | null;
    updatedby: number | null;
    log_inst: number | null;
    request_type: string;
    reference_id: number | null;
    status: string;
    request_data: string | null;
    requester_id: number;
    overall_status: string | null;
}>;
export declare const requestsController: {
    getRequestTypes(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllRequests(req: any, res: any): Promise<void>;
    getRequestsById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateRequests(req: any, res: any): Promise<any>;
    deleteRequests(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    takeActionOnRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getRequestsByUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getRequestByTypeAndReference(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=requests.controller.d.ts.map