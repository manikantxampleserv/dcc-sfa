import { Request, Response } from 'express';
export declare const cooler360Controller: {
    /**
     * Retrieves unified Cooler 360 view payload for a cooler/asset.
     *
     * @param {Request} req Express request with identifier param (id, code, serial, barcode).
     * @param {Response} res Express response.
     */
    getCooler360Data(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=cooler360.controller.d.ts.map