/**
 * @fileoverview Currencies Seeder
 * @description Creates 11 sample currencies for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockCurrency {
    code: string;
    name: string;
    symbol?: string;
    exchange_rate_to_base?: number;
    is_base?: string;
    is_active: string;
}
declare const mockCurrencies: MockCurrency[];
/**
 * Seed Currencies with mock data
 */
export declare function seedCurrencies(): Promise<void>;
/**
 * Clear Currencies data
 */
export declare function clearCurrencies(): Promise<void>;
export { mockCurrencies };
//# sourceMappingURL=currencies.seeder.d.ts.map