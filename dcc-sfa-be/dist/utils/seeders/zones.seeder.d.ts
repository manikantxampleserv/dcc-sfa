/**
 * @fileoverview Zones Seeder
 * @description Creates 11 sample zones for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockZone {
    name: string;
    code: string;
    description?: string;
    parent_id: number;
    depot_id?: number;
    supervisor_id?: number;
    is_active: string;
}
declare const mockZones: MockZone[];
/**
 * Seed Zones with mock data
 */
export declare function seedZones(): Promise<void>;
/**
 * Clear Zones data
 */
export declare function clearZones(): Promise<void>;
export { mockZones };
//# sourceMappingURL=zones.seeder.d.ts.map