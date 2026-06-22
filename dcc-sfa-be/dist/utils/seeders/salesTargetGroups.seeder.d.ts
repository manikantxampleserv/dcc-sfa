interface MockSalesTargetGroup {
    group_name: string;
    description?: string;
    is_active: string;
}
declare const mockSalesTargetGroups: MockSalesTargetGroup[];
export declare function seedSalesTargetGroups(): Promise<void>;
export declare function clearSalesTargetGroups(): Promise<void>;
export { mockSalesTargetGroups };
//# sourceMappingURL=salesTargetGroups.seeder.d.ts.map