/**
 * @fileoverview Unit of Measurement Seeder
 * @description Creates 11 sample units of measurement for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockUnitOfMeasurement {
    name: string;
    description?: string;
    category?: string;
    symbol?: string;
    is_active: string;
}
declare const mockUnitOfMeasurements: MockUnitOfMeasurement[];
/**
 * Seed Unit of Measurement with mock data
 */
export declare function seedUnitOfMeasurement(): Promise<void>;
/**
 * Clear Unit of Measurement data
 */
export declare function clearUnitOfMeasurement(): Promise<void>;
export { mockUnitOfMeasurements };
//# sourceMappingURL=unitOfMeasurement.seeder.d.ts.map