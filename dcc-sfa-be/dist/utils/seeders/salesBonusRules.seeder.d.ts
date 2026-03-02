interface MockSalesBonusRule {
    achievement_min_percent: number;
    achievement_max_percent: number;
    bonus_amount?: number;
    bonus_percent?: number;
    is_active: string;
}
declare const mockSalesBonusRules: MockSalesBonusRule[];
export declare function seedSalesBonusRules(): Promise<void>;
export declare function clearSalesBonusRules(): Promise<void>;
export { mockSalesBonusRules };
//# sourceMappingURL=salesBonusRules.seeder.d.ts.map