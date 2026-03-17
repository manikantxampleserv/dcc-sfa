/**
 * @fileoverview Companies Seeder
 * @description Creates 11 sample companies for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockCompany {
    name: string;
    code: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    phone_number?: string;
    email?: string;
    is_active: string;
}
declare const mockCompanies: MockCompany[];
/**
 * Seed Companies with mock data
 */
export declare function seedCompanies(): Promise<void>;
/**
 * Clear Companies data
 */
export declare function clearCompanies(): Promise<void>;
export { mockCompanies };
//# sourceMappingURL=companies.seeder.d.ts.map