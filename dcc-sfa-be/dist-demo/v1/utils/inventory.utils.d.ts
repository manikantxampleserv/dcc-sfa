export declare function getAvailableBatchesForProduct(tx: any, productId: number, loadingType: string): Promise<any[]>;
export declare function updateInventoryStock(tx: any, productId: number, locationId: number | null, quantity: number, loadingType: string, batchId?: number | null, serialId?: number | null, userId?: number, vanUserId?: number | null): Promise<void>;
export declare function createStockMovement(tx: any, data: {
    product_id: number;
    batch_id?: number | null;
    serial_id?: number | null;
    movement_type: string;
    reference_type: string;
    reference_id: number;
    from_location_id?: number | null;
    to_location_id?: number | null;
    quantity: number;
    remarks?: string;
    van_inventory_id?: number;
    createdby: number;
}): Promise<void>;
export declare function processVanInventoryItems(tx: any, inventory: any, items: any[], userId: number, loadingType: string, inventoryData: any): Promise<void>;
export declare function getContainerOwnerAndSelf(tx: any, userId: number): Promise<number[]>;
export declare function validateAndGetLocationId(tx: any, locationId: number | null | undefined): Promise<number | null>;
export declare function getOrderedQuantities(item: any): {
    orderedQty: number;
    orderedPieces: number;
    conversionFactor: number;
    uom: string;
};
export interface StockDeductionResult {
    newQuantity: number;
    newBaseQuantity: number;
    totalAvailablePieces: number;
    deductedPieces: number;
}
export declare function calculateStockDeduction(currentCases: number, currentPcs: number, piecesToDeduct: number, conversionFactor: number, unit?: string, orderedCases?: number): StockDeductionResult;
export declare function getContainerGroupUsers(tx: any, userId: number): Promise<number[]>;
//# sourceMappingURL=inventory.utils.d.ts.map