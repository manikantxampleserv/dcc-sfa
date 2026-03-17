import { Request, Response } from 'express';
export declare const creditNotesController: {
    upsertCreditNote(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createCreditNotes(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllCreditNotes(req: any, res: any): Promise<void>;
    getCreditNoteById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCreditNotes(req: any, res: any): Promise<any>;
    deleteCreditNotes(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=creditNotes.controller.d.ts.map