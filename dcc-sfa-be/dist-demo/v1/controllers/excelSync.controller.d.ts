import { Request, Response, NextFunction } from 'express';
/**
 * Controller for Excel Live Sync and Data Integration.
 * Exclusively serves flat CSV streams matching the Data Requirement Format template:
 * 1. Sales Data (/excel/sales-data)
 * 2. Outlet Master (/excel/outlet-master)
 * 3. Survey Data (/excel/survey-data)
 * 4. Van Load and Unload Detail (/excel/van-load-unload)
 */
export declare const excelSyncController: {
    /**
     * 1. Sales Data Endpoint (CSV Only)
     * Headers: EvDate, Depot, Coordinator, Supervisor, SellerCode, Salesman, Outlet Number,
     * Outlet Name, Zone, Route, Customer Channel, Customer Type, IDInv, Batch, Category, Flavour,
     * Volume, Brand, SKU Code, SKU, Pack, PhyCase, UnitCase, Turnover.
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next middleware
     */
    getSalesData(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    /**
     * 2. Outlet Master Endpoint (CSV Only)
     * Headers: Outlet Code, Outlet Name, Depot, Zone, Route, Outlet Type,
     * Outlet Channel, Outlet Category, Region, District, Contact Person, Phone Number, Latitude, Longitude.
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next middleware
     */
    getOutletMaster(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    /**
     * 3. Survey Data Endpoint (CSV Only)
     * Headers: Response ID, Date, Salesperson, Route code, Customer, Customer code,
     * Customer type, Location, Product, Qty not available.
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next middleware
     */
    getSurveyData(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    /**
     * 4. Van Load and Unload Detail Endpoint (CSV Only)
     * Headers: Date, Type, Van Inventory No, User Name, Product, Tracking Type, Quantity, Batch / Serials.
     *
     * @param {Request} req Express request
     * @param {Response} res Express response
     * @param {NextFunction} next Express next middleware
     */
    getVanLoadUnload(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=excelSync.controller.d.ts.map