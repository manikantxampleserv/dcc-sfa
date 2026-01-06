interface MockProductVolume {
    name: string;
    code: string;
    is_active: string;
}
declare const mockProductVolumes: MockProductVolume[];
export declare function seedProductVolumes(): Promise<void>;
export declare function clearProductVolumes(): Promise<void>;
export { mockProductVolumes };
//# sourceMappingURL=productVolumes.seeder.d.ts.map