interface MockTaxMaster {
    name: string;
    code: string;
    tax_rate: number;
    description?: string;
    is_active: string;
}
declare const mockTaxMasters: MockTaxMaster[];
export declare function seedTaxMaster(): Promise<void>;
export declare function clearTaxMaster(): Promise<void>;
export { mockTaxMasters };
//# sourceMappingURL=taxMaster.seeder.d.ts.map