/**
 * @fileoverview Customer Type (Outlet Type) Seeder
 * @description Creates customer types for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockCustomerType {
    type_name: string;
    type_code: string;
    is_active: string;
}
declare const mockCustomerTypes: MockCustomerType[];
export declare function seedCustomerType(): Promise<void>;
export declare function clearCustomerType(): Promise<void>;
export { mockCustomerTypes };
//# sourceMappingURL=customerType.seeder.d.ts.map