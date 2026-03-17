/**
 * @fileoverview Vehicles Seeder
 * @description Creates 11 sample vehicles for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockVehicle {
    vehicle_number: string;
    type: string;
    make?: string;
    model?: string;
    year?: number;
    capacity?: number;
    fuel_type?: string;
    assigned_to?: number;
    is_active: string;
}
declare const mockVehicles: MockVehicle[];
/**
 * Seed Vehicles with mock data
 */
export declare function seedVehicles(): Promise<void>;
/**
 * Clear Vehicles data
 */
export declare function clearVehicles(): Promise<void>;
export { mockVehicles };
//# sourceMappingURL=vehicles.seeder.d.ts.map