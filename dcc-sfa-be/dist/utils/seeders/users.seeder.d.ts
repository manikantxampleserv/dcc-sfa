/**
 * @fileoverview Users Seeder
 * @description Creates 11 sample users for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockUser {
    email: string;
    name: string;
    phone_number?: string;
    role_name: string;
    parent_id?: number;
    depot_id?: number;
    zone_id?: number;
    address?: string;
    employee_id?: string;
    joining_date?: Date;
    reporting_to?: number;
    is_active: string;
}
declare const mockUsers: MockUser[];
/**
 * Seed Users with mock data
 */
export declare function seedUsers(): Promise<void>;
/**
 * Clear Users data (but preserve admin user)
 */
export declare function clearUsers(): Promise<void>;
export { mockUsers };
//# sourceMappingURL=users.seeder.d.ts.map