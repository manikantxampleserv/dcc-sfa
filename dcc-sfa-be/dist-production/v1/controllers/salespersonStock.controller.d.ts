import { Request, Response } from 'express';
/**
 * Salesperson Stock Controller
 *
 * This controller replaces the old getSalespersonInventory method in
 * vanInventory.controller.ts with one that reads from inventory_stock —
 * the single source of truth for current hand stock quantities.
 *
 * Flow:
 *  1. Find the salesperson's van location_id(s) from van_inventory (is_active='Y')
 *  2. Query inventory_stock for those location IDs
 *  3. Group by product_id, sum current_stock
 *  4. Attach batch & serial info
 *  5. Return response matching SingleSalespersonResponse / AllSalespersonsResponse shape
 */
export declare const salespersonStockController: {
    /** GET /inventory-item-salesperson/:salesperson_id */
    getSalespersonInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=salespersonStock.controller.d.ts.map