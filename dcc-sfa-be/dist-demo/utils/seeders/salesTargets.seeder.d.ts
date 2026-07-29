interface MockSalesTarget {
    target_quantity: number;
    target_amount?: number;
    is_active: string;
}
declare const mockSalesTargets: MockSalesTarget[];
export declare function seedSalesTargets(): Promise<void>;
export declare function clearSalesTargets(): Promise<void>;
export { mockSalesTargets };
//# sourceMappingURL=salesTargets.seeder.d.ts.map