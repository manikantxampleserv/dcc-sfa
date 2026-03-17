interface MockCoolerSubType {
    name: string;
    code: string;
    cooler_type_name: string;
    is_active: string;
}
declare const mockCoolerSubTypes: MockCoolerSubType[];
export declare function seedCoolerSubTypes(): Promise<void>;
export declare function clearCoolerSubTypes(): Promise<void>;
export { mockCoolerSubTypes };
//# sourceMappingURL=coolerSubTypes.seeder.d.ts.map