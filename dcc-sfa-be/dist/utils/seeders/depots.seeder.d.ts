/**
 * @fileoverview Depots Seeder
 * @description Creates 11 sample depots for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockDepot {
    parent_id: number;
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    phone_number?: string;
    email?: string;
    manager_id?: number;
    supervisor_id?: number;
    coordinator_id?: number;
    latitude?: number;
    longitude?: number;
    is_active: string;
}
declare const mockDepots: MockDepot[];
/**
 * Seed Depots with mock data
 */
export declare function seedDepots(): Promise<void>;
/**
 * Clear Depots data
 */
export declare function clearDepots(): Promise<void>;
export { mockDepots };
//# sourceMappingURL=depots.seeder.d.ts.map