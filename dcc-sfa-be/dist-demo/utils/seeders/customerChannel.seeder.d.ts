/**
 * @fileoverview Customer Channel (Outlet Channel) Seeder
 * @description Creates customer channels for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockCustomerChannel {
    channel_name: string;
    channel_code: string;
    is_active: string;
}
declare const mockCustomerChannels: MockCustomerChannel[];
export declare function seedCustomerChannel(): Promise<void>;
export declare function clearCustomerChannel(): Promise<void>;
export { mockCustomerChannels };
//# sourceMappingURL=customerChannel.seeder.d.ts.map