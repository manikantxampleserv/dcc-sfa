/**
 * @fileoverview Batch Lots Seeder
 * @description Creates sample batch lots for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockBatchLot {
    batch_number: string;
    lot_number?: string;
    manufacturing_date: Date;
    expiry_date: Date;
    quantity: number;
    remaining_quantity: number;
    supplier_name?: string;
    purchase_price?: number;
    quality_grade?: string;
    storage_location?: string;
    is_active: string;
}
declare const mockBatchLots: MockBatchLot[];
/**
 * Seed Batch Lots with mock data
 */
export declare function seedBatchLots(): Promise<void>;
/**
 * Clear Batch Lots data
 */
export declare function clearBatchLots(): Promise<void>;
export { mockBatchLots };
//# sourceMappingURL=batchLots.seeder.d.ts.map