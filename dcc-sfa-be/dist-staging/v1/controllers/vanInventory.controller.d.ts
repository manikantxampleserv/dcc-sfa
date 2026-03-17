import { Request, Response } from 'express';
/**
 * @swagger
 * /api/v1/van-inventory/salesperson/{salesperson_id}:
 *   get:
 *     summary: Get salesperson inventory items
 *     tags: [Van Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: salesperson_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Salesperson ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: integer
 *         description: Filter by product ID
 *     responses:
 *       200:
 *         description: Salesperson inventory retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     salesperson_id:
 *                       type: integer
 *                     salesperson_name:
 *                       type: string
 *                     total_van_inventories:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/VanInventoryItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Bad request - Salesperson ID required
 *       404:
 *         description: Salesperson not found
 *       500:
 *         description: Internal server error
 */
export declare const vanInventoryController: {
    getSalespersonInventoryItems(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getSalespersonInventoryItemsDropdown(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAvailableBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createOrUpdateVanInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllVanInventory(req: any, res: any): Promise<void>;
    getVanInventoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateVanInventory(req: any, res: any): Promise<any>;
    deleteVanInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getVanInventoryItems(req: Request, res: Response): Promise<void>;
    updateVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteVanInventoryItem(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    bulkUpdateVanInventoryItems(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProductBatchDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getBulkProductBatches(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getSalespersonInventory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getinventoryItemSalesperson(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=vanInventory.controller.d.ts.map